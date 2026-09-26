import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatUgx } from "@/lib/format";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/parts/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-250 ease-out hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="relative aspect-square overflow-hidden bg-elevated">
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.hot ? <Badge variant="hot">Hot</Badge> : null}
          <Badge variant="steel">{product.grade}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium tracking-wide text-steel uppercase">
          {product.brand}
          {product.make ? ` · ${product.make}` : ""}
        </p>
        <h3 className="font-display text-lg leading-snug font-semibold tracking-tight text-foreground">
          {product.name}
        </h3>
        {product.fitment ? (
          <p className="text-sm text-muted-foreground">{product.fitment}</p>
        ) : null}
        <p className="mt-auto pt-2 font-medium tabular-nums text-foreground">
          {formatUgx(product.price_ugx)}
        </p>
      </div>
    </Link>
  );
}
