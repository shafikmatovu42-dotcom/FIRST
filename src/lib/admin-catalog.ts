import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { Product } from "@/lib/catalog";
import { getAdminSession } from "@/lib/admin-auth";

const ProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  brand: z.string().min(1, "Brand is required"),
  make: z.string().nullable().optional(),
  fitment: z.string().nullable().optional(),
  category_slug: z.string().min(1, "Category is required"),
  price_ugx: z.number().min(0, "Price must be positive"),
  grade: z.string().min(1, "Grade is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  hot: z.boolean().default(false),
  description: z.string().min(5, "Description is required"),
  image: z.string().min(1, "Image is required"),
});

export const createProduct = createServerFn({ method: "POST" })
  .validator(ProductSchema)
  .handler(async ({ data }) => {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const sql = await getSql();

    try {
      // Check slug uniqueness
      const existing = await sql.query<{ id: number }>(
        `select id from products where slug = $1 limit 1`,
        [data.slug],
      );
      if (existing.length > 0) {
        return { success: false, error: `Product with slug '${data.slug}' already exists.` };
      }

      const rows = await sql.query<Product>(
        `insert into products (slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, description, image)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         returning id, slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, description, image`,
        [
          data.slug,
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
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
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
          data.slug,
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
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
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
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
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
