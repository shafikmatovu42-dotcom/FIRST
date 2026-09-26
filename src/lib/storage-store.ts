/**
 * Storage CDN & Object Storage Helper
 * 
 * Pre-configured for Supabase Object Storage / CDN integration.
 * In local mode: Converts uploaded images to Data URLs or Blob URLs.
 * In Supabase mode: Uploads to Supabase Storage bucket 'product-images' and returns the CDN Public URL.
 */

export async function uploadProductImage(file: File): Promise<string> {
  const supabaseUrl = typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined;
  const supabaseAnonKey = typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : undefined;

  // If Supabase credentials are provided, upload to Supabase CDN Storage bucket
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/product-images/${fileName}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
          "Content-Type": file.type,
        },
        body: file,
      });

      if (res.ok) {
        // Return public CDN URL
        return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/product-images/${fileName}`;
      }
    } catch (err) {
      console.warn("Supabase CDN upload failed, falling back to Data URL preview:", err);
    }
  }

  // Fallback / Dev mode: convert file to compressed Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image file"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
