import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  sort_order: number;
};

export type ProductSummary = {
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
  image: string;
};

export type Product = ProductSummary & {
  description: string;
};

export type PaginatedProductsResult = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SiteShellData = {
  categories: Category[];
  settings: Record<string, string>;
};

const SUMMARY_COLS = `id, slug, name, brand, make, fitment, category_slug, price_ugx, grade, stock, hot, image`;
const FULL_COLS = `${SUMMARY_COLS}, description`;

const SHELL_SETTING_KEYS = [
  "store_name",
  "store_logo",
  "store_phone",
  "store_whatsapp",
  "store_email",
  "store_address",
  "store_hours",
  "hero_subtitle",
  "header_categories",
] as const;

const HERO_SETTING_KEYS = [
  "hero_image",
  "hero_image_1",
  "hero_image_2",
  "hero_image_3",
  "hero_image_4",
  "hero_image_5",
  "hero_location_tag",
  "hero_title",
  "hero_subtitle",
] as const;

/**
 * Single lightweight root payload for Header, Footer, Shell, and Contact.
 * Excludes hero slideshow images so non-home pages never download them.
 */
export const getPublicSiteShellData = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteShellData> => {
    try {
      const sql = await getSql();
      const [categories, settingRows] = await Promise.all([
        sql.query<Category>(
          `select slug, name, tagline, sort_order from categories order by sort_order asc`,
        ),
        sql.query<{ key: string; value: string }>(
          `select key, value from shop_settings where key = any($1::text[])`,
          [SHELL_SETTING_KEYS],
        ),
      ]);

      const settings: Record<string, string> = {};
      for (const r of settingRows) {
        settings[r.key] = r.value;
      }

      return { categories, settings };
    } catch {
      return { categories: [], settings: {} };
    }
  },
);

/**
 * Only fetched by the Home page for hero copy & slideshow image URLs.
 */
export const getHeroSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, string>> => {
    try {
      const sql = await getSql();
      const rows = await sql.query<{ key: string; value: string }>(
        `select key, value from shop_settings where key = any($1::text[])`,
        [HERO_SETTING_KEYS],
      );
      const settings: Record<string, string> = {};
      for (const r of rows) {
        settings[r.key] = r.value;
      }
      return settings;
    } catch {
      return {};
    }
  },
);

export const getPublicShopSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, string>> => {
    try {
      const sql = await getSql();
      const rows = await sql.query<{ key: string; value: string }>(
        "select key, value from shop_settings",
      );
      const settings: Record<string, string> = {};
      for (const r of rows) {
        settings[r.key] = r.value;
      }
      return settings;
    } catch {
      return {};
    }
  },
);

export const listCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    return sql.query<Category>(
      `select slug, name, tagline, sort_order from categories order by sort_order asc`,
    );
  },
);

export const listProductMakes = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const sql = await getSql();
    const rows = await sql.query<{ make: string }>(
      `select distinct make from products where make is not null and trim(make) <> '' order by make asc`,
    );
    return rows.map((r) => r.make);
  },
);

/**
 * Paginated, server-filtered product query.
 * Fetches only the current page slice and omits long descriptions.
 */
export const queryProducts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      q: z.string().optional(),
      cat: z.string().optional(),
      make: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(48).default(12),
    }),
  )
  .handler(async ({ data }): Promise<PaginatedProductsResult> => {
    const sql = await getSql();
    const conditions: string[] = [];
    const params: unknown[] = [];

    const cat = data.cat?.trim();
    if (cat && cat !== "all") {
      params.push(cat);
      conditions.push(`category_slug = $${params.length}`);
    }

    const make = data.make?.trim();
    if (make) {
      params.push(make);
      conditions.push(`make = $${params.length}`);
    }

    const q = data.q?.trim();
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      conditions.push(
        `(name ilike ${p} or brand ilike ${p} or coalesce(make, '') ilike ${p} or coalesce(fitment, '') ilike ${p} or grade ilike ${p})`,
      );
    }

    const whereClause =
      conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    const offset = (data.page - 1) * data.pageSize;

    const listParams = [...params, data.pageSize, offset];
    const limitParam = `$${params.length + 1}`;
    const offsetParam = `$${params.length + 2}`;

    const [countRows, items] = await Promise.all([
      sql.query<{ total: number }>(
        `select count(*) as total from products ${whereClause}`,
        params,
      ),
      sql.query<ProductSummary>(
        `select ${SUMMARY_COLS} from products ${whereClause} order by hot desc, name asc limit ${limitParam} offset ${offsetParam}`,
        listParams,
      ),
    ]);

    const total = Number(countRows[0]?.total ?? 0);
    return {
      items,
      total,
      page: data.page,
      pageSize: data.pageSize,
      hasMore: offset + items.length < total,
    };
  });

export const listHotProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductSummary[]> => {
    const sql = await getSql();
    return sql.query<ProductSummary>(
      `select ${SUMMARY_COLS} from products order by hot desc, price_ugx desc limit 8`,
    );
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<Product | null> => {
    const sql = await getSql();
    const rows = await sql.query<Product>(
      `select ${FULL_COLS} from products where slug = $1 limit 1`,
      [data.slug],
    );
    return rows[0] ?? null;
  });

export const getProductById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }): Promise<Product | null> => {
    const sql = await getSql();
    const rows = await sql.query<Product>(
      `select ${FULL_COLS} from products where id = $1 limit 1`,
      [data.id],
    );
    return rows[0] ?? null;
  });

export const listRelatedProducts = createServerFn({ method: "GET" })
  .validator(
    z.object({ slug: z.string().min(1), category: z.string().min(1) }),
  )
  .handler(async ({ data }): Promise<ProductSummary[]> => {
    const sql = await getSql();
    return sql.query<ProductSummary>(
      `select ${SUMMARY_COLS} from products where category_slug = $1 and slug <> $2 order by hot desc limit 4`,
      [data.category, data.slug],
    );
  });
