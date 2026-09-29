import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_SUPABASE_URL = "https://laqnlgnnfvtoaktfwija.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcW5sZ25uZnZ0b2FrdGZ3aWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMzU1NTksImV4cCI6MjEwNTkxMTU1OX0.9bSjku7wZKoW_BvumqDDvqlnPyQUZIMO7diNkS0Ek0U";

interface CompressedImageResult {
  blob: Blob;
  mimeType: string;
  base64Data: string;
}

/**
 * Compresses and resizes image files client-side using HTML5 Canvas before upload
 */
async function compressImageFile(file: File, maxDimension = 1600, quality = 0.82): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const commaIdx = dataUrl.indexOf(",");
        const base64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
        const blob = new Blob([file], { type: file.type || "image/jpeg" });
        resolve({ blob, mimeType: file.type || "image/jpeg", base64Data });
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
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

      const mimeType = "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const resStr = reader.result as string;
              const commaIdx = resStr.indexOf(",");
              const base64Data = commaIdx >= 0 ? resStr.slice(commaIdx + 1) : resStr;
              resolve({ blob, mimeType, base64Data });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          } else {
            reject(new Error("Canvas blob conversion failed"));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
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
    })
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
          "Content-Type": data.mimeType || "image/jpeg",
          "x-upsert": "true",
        },
        body: buffer,
      });

      if (res.ok) {
        const publicUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/product-images/${cleanFileName}`;
        console.log("[Storage Server] Uploaded successfully to Supabase CDN:", publicUrl);
        return { success: true, url: publicUrl };
      } else {
        const errText = await res.text();
        console.warn("[Storage Server] Supabase Storage error:", res.status, errText);
        return { success: false, error: `Supabase HTTP ${res.status}: ${errText}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload exception";
      console.error("[Storage Server] Exception during upload:", msg);
      return { success: false, error: msg };
    }
  });

/**
 * Public function to upload a product image exclusively to the Supabase Storage Bucket.
 * Never returns raw base64 data URLs.
 */
export async function uploadProductImage(file: File): Promise<string> {
  // Step 1: Compress image client-side to ensure fast upload
  let compressed: CompressedImageResult;
  try {
    compressed = await compressImageFile(file);
  } catch (err) {
    console.warn("[Storage Client] Canvas compression error, falling back to raw file:", err);
    compressed = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resStr = reader.result as string;
        const commaIdx = resStr.indexOf(",");
        const base64Data = commaIdx >= 0 ? resStr.slice(commaIdx + 1) : resStr;
        const blob = new Blob([file], { type: file.type || "image/jpeg" });
        resolve({ blob, mimeType: file.type || "image/jpeg", base64Data });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Step 2: Try Direct Client-to-Supabase REST Upload first (fastest, direct to bucket)
  const clientUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const clientKey =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;

  let directError: string | null = null;
  if (clientUrl && clientKey) {
    try {
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const targetEndpoint = `${clientUrl.replace(/\/$/, "")}/storage/v1/object/product-images/${cleanFileName}`;

      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientKey}`,
          apikey: clientKey,
          "Content-Type": compressed.mimeType,
          "x-upsert": "true",
        },
        body: compressed.blob,
      });

      if (res.ok) {
        const publicUrl = `${clientUrl.replace(/\/$/, "")}/storage/v1/object/public/product-images/${cleanFileName}`;
        console.log("[Storage Client] Direct REST upload to Supabase Bucket successful:", publicUrl);
        return publicUrl;
      } else {
        const text = await res.text();
        directError = `HTTP ${res.status}: ${text}`;
        console.warn("[Storage Client] Direct REST upload returned error:", directError);
      }
    } catch (clientErr) {
      directError = clientErr instanceof Error ? clientErr.message : "Client network error";
      console.warn("[Storage Client] Direct REST upload failed:", clientErr);
    }
  }

  // Step 3: Server Function RPC upload fallback
  let serverError: string | null = null;
  try {
    const serverResult = await uploadProductImageServer({
      data: {
        fileName: file.name,
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

  // If both direct client and server bucket uploads fail, throw explicit error
  throw new Error(`Failed to upload to Supabase bucket. Direct error: [${directError || "N/A"}], Server error: [${serverError || "N/A"}]`);
}


