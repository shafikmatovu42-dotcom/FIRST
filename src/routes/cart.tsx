import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import {
  cartTotal,
  cartWhatsAppText,
  useCart,
} from "@/lib/cart-store";
import { formatUgx } from "@/lib/format";
import { whatsappUrl } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Empty. Add a lamp or a grill from the catalog, or send a photo on WhatsApp
          and we will price it.
        </p>
        <Button asChild className="mt-6">
          <Link to="/shop" search={{}}>
            Browse parts
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex gap-4 rounded-xl bg-card p-3 shadow-[var(--shadow-border)]"
            >
              <Link
                to="/parts/$slug"
                params={{ slug: item.slug }}
                className="size-24 shrink-0 overflow-hidden rounded-md bg-elevated"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/parts/headlamp.jpg";
                  }}
                  className="size-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to="/parts/$slug"
                  params={{ slug: item.slug }}
                  className="font-display text-lg font-semibold tracking-tight hover:text-steel"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">{item.brand}</p>
                <p className="mt-1 font-medium tabular-nums">
                  {formatUgx(item.price_ugx)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex size-11 items-center justify-center rounded-md bg-elevated"
                    onClick={() => setQty(item.productId, item.qty - 1)}
                    aria-label="Decrease"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center tabular-nums">{item.qty}</span>
                  <button
                    type="button"
                    className="flex size-11 items-center justify-center rounded-md bg-elevated"
                    onClick={() => setQty(item.productId, item.qty + 1)}
                    aria-label="Increase"
                  >
                    <Plus className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="ml-auto flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                    onClick={() => remove(item.productId)}
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="mt-1 text-2xl font-medium tabular-nums">{formatUgx(total)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Prices are UGX. Confirm stock before you travel.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/checkout">Checkout</Link>
          </Button>
          <Button variant="outline" asChild className="mt-2 w-full">
            <a
              href={whatsappUrl(cartWhatsAppText(items))}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon className="size-4" />
              Send cart on WhatsApp
            </a>
          </Button>
        </aside>
      </div>
    </div>
  );
}
