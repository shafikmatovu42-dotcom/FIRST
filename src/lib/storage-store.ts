import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_SUPABASE_URL = "https://laqnlgnnfvtoaktfwija.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcW5sZ25uZnZ0b2FrdGZ3aWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMzU1NTksImV4cCI6MjEwNTkxMTU1OX0.9bSjku7wZKoW_BvumqDDvqlnPyQUZIMO7diNkS0Ek0U";

interface CompressedImageResult {
  blob: Blob;
  mimeType: string;
  extension: string;
  base64Data: string;
}

export interface UploadImageOptions {
  maxDimension?: number;
  quality?: number;
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resStr = reader.result as string;
      const commaIdx = resStr.indexOf(",");
      resolve(commaIdx >= 0 ? resStr.slice(commaIdx + 1) : resStr);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compresses and resizes image files client-side using HTML5 Canvas before upload.
 * Prefers WebP when supported (typically 40-65% smaller than JPEG) with JPEG fallback.
 */
async function compressImageFile(
  file: File,
  maxDimension = 1000,
  quality = 0.78,
): Promise<CompressedImageResult> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    const blob = new Blob([file], { type: file.type || "image/jpeg" });
    const base64Data = await blobToBase64(blob);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    return { blob, mimeType: file.type || "image/jpeg", extension: ext, base64Data };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to initialize 2D canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first; fall back to JPEG if browser lacks WebP canvas export
        let blob = await encodeCanvas(canvas, "image/webp", quality);
        let mimeType = "image/webp";
        let extension = "webp";

        if (!blob || blob.type !== "image/webp") {
          blob = await encodeCanvas(canvas, "image/jpeg", quality);
          mimeType = "image/jpeg";
          extension = "jpg";
        }

        if (!blob) {
          reject(new Error("Canvas blob conversion failed"));
          return;
        }

        const base64Data = await blobToBase64(blob);
        resolve({ blob, mimeType, extension, base64Data });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

function buildCleanFileName(originalName: string, extension: string): string {
  const base = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 60);
  return `${Date.now()}_${base || "image"}.${extension}`;
}

/**
 * Server-side upload function for Supabase Storage
 */
export const uploadProductImageServer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fileName: z.string(),
      mimeType: z.string(),
      base64Data: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const supabaseUrl = (
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.SUPERBASE_URL ||
      DEFAULT_SUPABASE_URL
    ).trim();

    const apiKey = (
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPERBASE_PUBLISHABLE_KEY ||
      DEFAULT_SUPABASE_ANON_KEY
    ).trim();

    try {
      const cleanFileName = `${Date.now()}_${data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/product-images/${cleanFileName}`;

      const buffer = Buffer.from(data.base64Data, "base64");

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          apikey: apiKey,
          "Content-Type": data.mimeType || "image/webp",
          "cache-control": "31536000",
          "x-upsert": "true",
        },
        body: buffer,
      });

      if (res.ok) {
        const publicUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/product-images/${cleanFileName}`;
        return { success: true, url: publicUrl };
      }
      const errText = await res.text();
      return { success: false, error: `Supabase HTTP ${res.status}: ${errText}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload exception";
      return { success: false, error: msg };
    }
  });

/**
 * Public function to upload an optimized image exclusively to Supabase Storage.
 * Never returns raw base64 data URLs.
 */
export async function uploadProductImage(
  file: File,
  options: UploadImageOptions = {},
): Promise<string> {
  const { maxDimension = 1000, quality = 0.78 } = options;

  let compressed: CompressedImageResult;
  try {
    compressed = await compressImageFile(file, maxDimension, quality);
  } catch (err) {
    console.warn("[Storage Client] Canvas compression error, falling back to raw file:", err);
    const blob = new Blob([file], { type: file.type || "image/jpeg" });
    const base64Data = await blobToBase64(blob);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    compressed = {
      blob,
      mimeType: file.type || "image/jpeg",
      extension: ext,
      base64Data,
    };
  }

  const cleanFileName = buildCleanFileName(file.name, compressed.extension);

  // Direct Client-to-Supabase REST Upload first (fastest, avoids server RPC payload overhead)
  const clientUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;
  const clientKey =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    DEFAULT_SUPABASE_ANON_KEY;

  let directError: string | null = null;
  if (clientUrl && clientKey) {
    try {
      const targetEndpoint = `${clientUrl.replace(/\/$/, "")}/storage/v1/object/product-images/${cleanFileName}`;

      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientKey}`,
          apikey: clientKey,
          "Content-Type": compressed.mimeType,
          "cache-control": "31536000",
          "x-upsert": "true",
        },
        body: compressed.blob,
      });

      if (res.ok) {
        return `${clientUrl.replace(/\/$/, "")}/storage/v1/object/public/product-images/${cleanFileName}`;
      }
      const text = await res.text();
      directError = `HTTP ${res.status}: ${text}`;
    } catch (clientErr) {
      directError = clientErr instanceof Error ? clientErr.message : "Client network error";
    }
  }

  // Server Function RPC upload fallback
  let serverError: string | null = null;
  try {
    const serverResult = await uploadProductImageServer({
      data: {
        fileName: cleanFileName,
        mimeType: compressed.mimeType,
        base64Data: compressed.base64Data,
      },
    });

    if (serverResult.success && serverResult.url) {
      return serverResult.url;
    }
    serverError = serverResult.error || "Server function failed";
  } catch (serverErr) {
    serverError = serverErr instanceof Error ? serverErr.message : "Server RPC network error";
  }

  throw new Error(
    `Failed to upload to Supabase bucket. Direct error: [${directError || "N/A"}], Server error: [${serverError || "N/A"}]`,
  );
}
