import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Storage CDN & Object Storage Helper
 * 
 * Server-side upload function:
 * Bypasses browser CORS restrictions and uploads files directly to Supabase Storage bucket 'product-images'.
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
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPERBASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPERBASE_PUBLISHABLE_KEY;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    const apiKey = secretKey || anonKey;

    if (!supabaseUrl || !apiKey) {
      console.warn("[Storage] Missing Supabase URL or Key in server environment");
      return { success: false, error: "Supabase credentials missing" };
    }

    try {
      const cleanFileName = `${Date.now()}_${data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/product-images/${cleanFileName}`;

      // Convert base64 back to binary Buffer
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
        console.warn("[Storage Server] Supabase Storage returned error:", res.status, errText);
        return { success: false, error: errText };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("[Storage Server] Upload exception:", msg);
      return { success: false, error: msg };
    }
  });

export async function uploadProductImage(file: File): Promise<string> {
  try {
    // Read file as base64 string
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Strip data:image/...;base64, prefix
          const commaIdx = reader.result.indexOf(",");
          resolve(commaIdx >= 0 ? reader.result.slice(commaIdx + 1) : reader.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

    // Send to Server Function for direct Supabase Storage upload
    const result = await uploadProductImageServer({
      data: {
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        base64Data,
      },
    });

    if (result.success && result.url) {
      return result.url;
    }
  } catch (err) {
    console.warn("[Storage Client] Server upload failed, using fallback:", err);
  }

  // Fallback mode: lightweight local canvas compression
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } else {
        URL.revokeObjectURL(url);
        resolve("/parts/headlamp.jpg");
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("/parts/headlamp.jpg");
    };

    img.src = url;
  });
}
