import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { listCategories, listProducts } from "@/lib/catalog";
import { parseShopSearch, shopSearch, type ShopSearch } from "@/lib/shop-search";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  validateSearch: parseShopSearch,
  loader: async () => {
    const [products, categories] = await Promise.all([
      listProducts(),
      listCategories(),
    ]);
    return { products, categories };
  },
  component: ShopPage,
});

function ShopPage() {
  const { products, categories } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const q = (search.q ?? "").trim().toLowerCase();
  const cat = search.cat ?? "";
  const make = search.make ?? "";

  const makes = [
    ...new Set(
      products.map((p) => p.make).filter((m): m is string => Boolean(m)),
    ),
  ].sort();

  const filtered = products.filter((p) => {
    if (cat && p.category_slug !== cat) return false;
    if (make && p.make !== make) return false;
    if (!q) return true;
    const hay =
      `${p.name} ${p.brand} ${p.make ?? ""} ${p.fitment ?? ""} ${p.grade}`.toLowerCase();
    return hay.includes(q);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-medium tracking-widest text-steel uppercase">
        Catalog
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
        All parts
      </h1>
      <p className="mt-2 text-sm text-muted-foreground tabular-nums">
        {filtered.length} of {products.length} listed
      </p>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const next = String(fd.get("q") ?? "");
          void navigate({
            to: "/shop",
            search: shopSearch({ q: next, cat, make }),
          });
        }}
      >
        <Input
          name="q"
          defaultValue={search.q ?? ""}
          placeholder="Search make, lamp, grill…"
          aria-label="Filter parts"
        />
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip active={!cat} search={shopSearch({ q: search.q, make })}>
          All
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.slug}
            active={cat === c.slug}
            search={shopSearch({ q: search.q, cat: c.slug, make })}
          >
            {c.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip active={!make} search={shopSearch({ q: search.q, cat })}>
          Any make
        </FilterChip>
        {makes.map((m) => (
          <FilterChip
            key={m}
            active={make === m}
            search={shopSearch({ q: search.q, cat, make: m })}
          >
            {m}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">
          No parts match those filters. Clear a chip or try another search.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  search,
  children,
}: {
  active: boolean;
  search: ShopSearch;
  children: ReactNode;
}) {
  return (
    <Link
      to="/shop"
      search={search}
      className={cn(
        "inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-elevated text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
