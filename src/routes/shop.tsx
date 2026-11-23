import { useEffect, useState, type ReactNode } from "react";
import {
  createFileRoute,
  Link,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listProductMakes,
  queryProducts,
  type ProductSummary,
} from "@/lib/catalog";
import { parseShopSearch, shopSearch, type ShopSearch } from "@/lib/shop-search";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/shop")({
  validateSearch: parseShopSearch,
  loaderDeps: ({ search }) => ({
    q: search.q ?? "",
    cat: search.cat ?? "",
    make: search.make ?? "",
  }),
  loader: async ({ deps }) => {
    const [pageData, makes] = await Promise.all([
      queryProducts({
        data: {
          q: deps.q || undefined,
          cat: deps.cat || undefined,
          make: deps.make || undefined,
          page: 1,
          pageSize: PAGE_SIZE,
        },
      }),
      listProductMakes(),
    ]);
    return { pageData, makes };
  },
  component: ShopPage,
});

function ShopPage() {
  const { pageData, makes } = Route.useLoaderData();
  const { categories } = useLoaderData({ from: "__root__" });
  const search = Route.useSearch();
  const navigate = useNavigate();

  const q = search.q ?? "";
  const cat = search.cat ?? "";
  const make = search.make ?? "";

  const [items, setItems] = useState<ProductSummary[]>(pageData.items);
  const [page, setPage] = useState(pageData.page);
  const [hasMore, setHasMore] = useState(pageData.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync incremental state whenever filters/loader data change
  useEffect(() => {
    setItems(pageData.items);
    setPage(pageData.page);
    setHasMore(pageData.hasMore);
  }, [pageData]);

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const next = await queryProducts({
        data: {
          q: q || undefined,
          cat: cat || undefined,
          make: make || undefined,
          page: nextPage,
          pageSize: PAGE_SIZE,
        },
      });
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const fresh = next.items.filter((item) => !seen.has(item.id));
        return [...prev, ...fresh];
      });
      setPage(next.page);
      setHasMore(next.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-medium tracking-widest text-steel uppercase">
        Catalog
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
        All parts
      </h1>
      <p className="mt-2 text-sm text-muted-foreground tabular-nums">
        Showing {items.length} of {pageData.total} listed
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
          key={search.q ?? ""}
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

      {makes.length > 0 && (
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
      )}

      {items.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">
          No parts match those filters. Clear a chip or try another search.
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, idx) => (
              <ProductCard key={p.id} product={p} priority={idx < 3} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={loadingMore}
                onClick={handleLoadMore}
              >
                {loadingMore
                  ? "Loading more…"
                  : `Load more (${pageData.total - items.length} remaining)`}
              </Button>
            </div>
          )}
        </>
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
