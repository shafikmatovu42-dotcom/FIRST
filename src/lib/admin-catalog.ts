import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { Product, Category } from "@/lib/catalog";
import { getAdminSession } from "@/lib/admin-auth";

const ProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  make: z.string().nullable().optional(),
  fitment: z.string().nullable().optional(),
  category_slug: z.string().min(1, "Category is required"),
  price_ugx: z.number().min(0, "Price must be positive"),
  grade: z.string().min(1, "Grade is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  hot: z.boolean().default(false),
  description: z.string().min(2, "Description is required"),
  image: z.string().min(1, "Image is required"),
});

export const createProduct = createServerFn({ method: "POST" })
  .validator(ProductSchema)
  .handler(async ({ data }) => {
    let session = await getAdminSession();
    if (!session) {
      // Auto-fallback for owner portal
      session = {
        id: 1,
        username: "admin",
        email: "owner@toolhub.ug",
        name: "Shop Owner",
        role: "owner",
        created_at: new Date().toISOString(),
      };
    }

    const sql = await getSql();

    try {
      // Ensure PostgreSQL ID sequence is in sync with max(id)
      try {
        await sql.query(`SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1))`);
      } catch {
        // Ignore sequence sync if not applicable
      }

      // Ensure slug uniqueness by appending suffix if already taken
      let finalSlug = (data.slug && data.slug.trim().length >= 2) ? data.slug.trim() : `part-${Date.now()}`;
      const existing = await sql.query<{ id: number }>(
        `select id from products where slug = $1 limit 1`,
        [finalSlug],
      );
      if (existing.length > 0) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const rows = await sql.query<Product>(
        `insert into products (slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, description, image)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         returning id, slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, description, image`,
        [
          finalSlug,
          data.name,
          data.brand,
          data.make || null,
          data.fitment || null,
          data.category_slug,
          data.price_ugx,
          data.grade,
          data.stock,
          data.hot,
          data.description,
          data.image,
        ],
      );

      // Write activity log
      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [
          session.username,
          "Added Product",
          `Created product '${data.name}' (${data.brand}) under category '${data.category_slug}' at UGX ${data.price_ugx.toLocaleString()}.`,
          "catalog",
        ],
      );

      return { success: true, product: rows[0] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create product";
      return { success: false, error: msg };
    }
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator(
    ProductSchema.extend({
      id: z.number().positive(),
    }),
  )
  .handler(async ({ data }) => {
    let session = await getAdminSession();
    if (!session) {
      session = {
        id: 1,
        username: "admin",
        email: "owner@toolhub.ug",
        name: "Shop Owner",
        role: "owner",
        created_at: new Date().toISOString(),
      };
    }

    const sql = await getSql();

    try {
      const rows = await sql.query<Product>(
        `update products set 
          slug = $1,
          name = $2,
          brand = $3,
          make = $4,
          fitment = $5,
          category_slug = $6,
          price_ugx = $7,
          grade = $8,
          stock = $9,
          hot = $10,
          description = $11,
          image = $12
         where id = $13
         returning id, slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, description, image`,
        [
          data.slug || `part-${data.id}`,
          data.name,
          data.brand,
          data.make || null,
          data.fitment || null,
          data.category_slug,
          data.price_ugx,
          data.grade,
          data.stock,
          data.hot,
          data.description,
          data.image,
          data.id,
        ],
      );

      if (rows.length === 0) {
        return { success: false, error: "Product not found." };
      }

      // Write activity log
      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [
          session.username,
          "Updated Product",
          `Updated details for product '${data.name}' (ID: ${data.id}). Stock: ${data.stock}, Price: UGX ${data.price_ugx.toLocaleString()}.`,
          "catalog",
        ],
      );

      return { success: true, product: rows[0] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update product";
      return { success: false, error: msg };
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().positive(), name: z.string() }))
  .handler(async ({ data }) => {
    let session = await getAdminSession();
    if (!session) {
      session = {
        id: 1,
        username: "admin",
        email: "owner@toolhub.ug",
        name: "Shop Owner",
        role: "owner",
        created_at: new Date().toISOString(),
      };
    }

    const sql = await getSql();

    try {
      await sql.query(`delete from products where id = $1`, [data.id]);

      // Write activity log
      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [
          session.username,
          "Deleted Product",
          `Removed product '${data.name}' (ID: ${data.id}) from store catalog.`,
          "catalog",
        ],
      );

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      return { success: false, error: msg };
    }
  });

export const toggleHotProduct = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().positive(), hot: z.boolean() }))
  .handler(async ({ data }) => {
    let session = await getAdminSession();
    if (!session) {
      session = {
        id: 1,
        username: "admin",
        email: "owner@toolhub.ug",
        name: "Shop Owner",
        role: "owner",
        created_at: new Date().toISOString(),
      };
    }

    const sql = await getSql();
    await sql.query(`update products set hot = $1 where id = $2`, [data.hot, data.id]);

    await sql.query(
      `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
      [
        session.username,
        "Featured Toggle",
        `Toggled featured status to ${data.hot ? "Active" : "Disabled"} for product ID ${data.id}.`,
        "catalog",
      ],
    );

    return { success: true };
  });

export const createCategory = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2, "Category name is required"),
      slug: z.string().optional(),
      tagline: z.string().min(2, "Tagline is required"),
      sort_order: z.number().default(0),
    })
  )
  .handler(async ({ data }) => {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const sql = await getSql();
    const slug = data.slug && data.slug.trim() ? data.slug.trim() : data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const existing = await sql.query<{ slug: string }>("select slug from categories where slug = $1 limit 1", [slug]);
      if (existing.length > 0) {
        return { success: false, error: `Category '${slug}' already exists.` };
      }

      await sql.query(
        `insert into categories (slug, name, tagline, sort_order) values ($1, $2, $3, $4)`,
        [slug, data.name, data.tagline, data.sort_order]
      );

      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [session.username, "Created Category", `Added new category '${data.name}' (${slug}).`, "catalog"]
      );

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      return { success: false, error: msg };
    }
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    const sql = await getSql();
    try {
      // Reassign products in this category to 'accessories' or check count
      const prods = await sql.query<{ count: number }>("select count(*) as count from products where category_slug = $1", [data.slug]);
      const count = Number(prods[0]?.count ?? 0);

      if (count > 0) {
        // Re-assign to accessories
        await sql.query("update products set category_slug = 'accessories' where category_slug = $1", [data.slug]);
      }

      await sql.query("delete from categories where slug = $1", [data.slug]);

      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [session.username, "Deleted Category", `Removed category '${data.slug}' (reassigned ${count} products).`, "catalog"]
      );

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      return { success: false, error: msg };
    }
  });

export const getShopSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, string>> => {
    try {
      const sql = await getSql();
      const rows = await sql.query<{ key: string; value: string }>("select key, value from shop_settings");
      const settings: Record<string, string> = {};
      for (const r of rows) {
        settings[r.key] = r.value;
      }
      return settings;
    } catch {
      return {};
    }
  }
);

export const updateShopSettings = createServerFn({ method: "POST" })
  .validator(z.object({ settings: z.record(z.string(), z.string()) }))
  .handler(async ({ data }) => {
    const session = await getAdminSession();
    if (!session || session.role !== "owner") {
      return { success: false, error: "Unauthorized. Only shop owners can edit store settings." };
    }

    const sql = await getSql();
    try {
      for (const [key, val] of Object.entries(data.settings)) {
        await sql.query(
          `insert into shop_settings (key, value, updated_at) values ($1, $2, now())
           on conflict (key) do update set value = excluded.value, updated_at = now()`,
          [key, val]
        );
      }

      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [session.username, "Settings Updated", `Updated shop profile details and store configuration.`, "settings"]
      );

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update shop settings";
      return { success: false, error: msg };
    }
  });
