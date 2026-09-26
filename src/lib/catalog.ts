import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  sort_order: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  make: string | null;
  fitment: string | null;
  category_slug: string;
  price_ugx: number;
  grade: string;
  stock: number;
  hot: boolean;
  description: string;
  image: string;
};

const COLS = `id, slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, description, image`;

export const listCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    return sql.query<Category>(
      `select slug, name, tagline, sort_order from categories order by sort_order asc`,
    );
  },
);

export const listProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    return sql.query<Product>(
      `select ${COLS} from products order by hot desc, name asc`,
    );
  },
);

export const listHotProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    return sql.query<Product>(
      `select ${COLS} from products where hot = true order by price_ugx desc limit 8`,
    );
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<Product>(
      `select ${COLS} from products where slug = $1 limit 1`,
      [data.slug],
    );
    return rows[0] ?? null;
  });

export const listRelatedProducts = createServerFn({ method: "GET" })
  .validator(
    z.object({ slug: z.string().min(1), category: z.string().min(1) }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    return sql.query<Product>(
      `select ${COLS} from products where category_slug = $1 and slug <> $2 order by hot desc limit 4`,
      [data.category, data.slug],
    );
  });
