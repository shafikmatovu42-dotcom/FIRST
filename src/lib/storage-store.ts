import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Storage CDN & Object Storage Helper
 * 
 * Multi-layer Upload Pipeline:
 * 1. Client Canvas Compression (reduces 10MB camera photos to ~250KB in milliseconds)
 * 2. Direct Client-to-Supabase REST Upload (bypasses serverless payload limits & server bottlenecks)
 * 3. Server Function Fallback (`uploadProductImageServer`)
 * 4. Compressed Data-URI Fallback (guarantees user's image is saved even if Supabase is unconfigured)
 */

interface CompressedImageResult {
  blob: Blob;
  mimeType: string;
  base64Data: string;
  dataUrl: string;
}

/**
 * Compresses and resizes image files client-side using HTML5 Canvas
 */
async function compressImageFile(file: File, maxDimension = 1600, quality = 0.82): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const commaIdx = dataUrl.indexOf(",");
        const base64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
        const blob = new Blob([file], { type: file.type });
        resolve({ blob, mimeType: file.type || "image/jpeg", base64Data, dataUrl });
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
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const commaIdx = dataUrl.indexOf(",");
      const base64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, mimeType, base64Data, dataUrl });
          } else {
            // Fall back to dataUrl conversion if toBlob is unavailable
            const byteString = atob(base64Data);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const fallbackBlob = new Blob([ab], { type: mimeType });
            resolve({ blob: fallbackBlob, mimeType, base64Data, dataUrl });
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
      ""
    ).trim();

    const apiKey = (
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPERBASE_PUBLISHABLE_KEY ||
      ""
    ).trim();

    if (!supabaseUrl || !apiKey) {
      console.warn("[Storage Server] Missing Supabase credentials in server environment");
      return { success: false, error: "Supabase credentials missing" };
    }

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
        console.log("[Storage Server] Uploaded successfully to CDN:", publicUrl);
        return { success: true, url: publicUrl };
      } else {
        const errText = await res.text();
        console.warn("[Storage Server] Supabase Storage error:", res.status, errText);
        return { success: false, error: errText };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("[Storage Server] Exception during upload:", msg);
      return { success: false, error: msg };
    }
  });

/**
 * Public function to upload a product image.
 * Uses client compression -> direct client REST upload -> server function -> compressed data URI.
 */
export async function uploadProductImage(file: File): Promise<string> {
  // Step 1: Compress image client-side to ensure fast uploads & minimal payload
  let compressed: CompressedImageResult;
  try {
    compressed = await compressImageFile(file);
  } catch (err) {
    console.warn("[Storage Client] Canvas compression warning, using raw file reader:", err);
    compressed = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const commaIdx = dataUrl.indexOf(",");
        const base64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
        const blob = new Blob([file], { type: file.type || "image/jpeg" });
        resolve({ blob, mimeType: file.type || "image/jpeg", base64Data, dataUrl });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Step 2: Attempt Direct Client-to-Supabase Storage REST Upload if browser env keys exist
  try {
    const clientUrl =
      typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_SUPABASE_URL as string)
        : "";
    const clientKey =
      typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
        : "";

    if (clientUrl && clientKey) {
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
        console.log("[Storage Client] Direct REST upload successful:", publicUrl);
        return publicUrl;
      }
    }
  } catch (clientErr) {
    console.warn("[Storage Client] Direct REST upload failed, falling back to server function:", clientErr);
  }

  // Step 3: Attempt Server Function RPC upload
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
    console.warn("[Storage Client] Server function returned error:", serverResult.error);
  } catch (serverErr) {
    console.warn("[Storage Client] Server function call failed:", serverErr);
  }

  // Step 4: Final Fallback - Return compressed Data URI string (~200KB)
  // Ensures user image ALWAYS updates without falling back to blank or default stock image!
  console.log("[Storage Client] Returning compressed Data-URI fallback for selected image.");
  return compressed.dataUrl;
}

