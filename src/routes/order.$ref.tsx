import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatUgx } from "@/lib/format";
import { getOrder, type GuestOrder } from "@/lib/orders-store";
import { SHOP } from "@/lib/shop";

export const Route = createFileRoute("/order/$ref")({
  component: OrderPage,
});

const METHOD_LABEL: Record<GuestOrder["method"], string> = {
  mtn: "MTN Mobile Money (demo)",
  airtel: "Airtel Money (demo)",
  pickup: "Cash at pickup",
  whatsapp: "WhatsApp",
};

function OrderPage() {
  const { ref } = Route.useParams();
  const [order, setOrder] = useState<GuestOrder | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrder(ref) ?? null);
  }, [ref]);

  if (order === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sm text-muted-foreground">Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="font-display text-3xl font-semibold">Order not on this device</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Guest orders are saved in this browser only. If you placed it on another
          phone, call the shop with the reference.
        </p>
        <Button asChild className="mt-6">
          <Link to="/shop" search={{}}>
            Back to shop
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium tracking-widest text-steel uppercase">
        Order placed
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
        {order.ref}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Show this reference at {SHOP.address}. {METHOD_LABEL[order.method]}.
      </p>
      <ul className="mt-8 divide-y divide-border rounded-xl bg-card shadow-[var(--shadow-border)]">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm">
              {item.name}{" "}
              <span className="text-muted-foreground tabular-nums">× {item.qty}</span>
            </span>
            <span className="text-sm tabular-nums">
              {formatUgx(item.price_ugx * item.qty)}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between px-4 py-3 font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatUgx(order.total)}</span>
        </li>
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        {order.fulfilment === "pickup" ? "Pickup" : "Boda dispatch"} · {order.phone}
      </p>
      <Button asChild className="mt-8">
        <Link to="/shop" search={{}}>
          Keep shopping
        </Link>
      </Button>
    </div>
  );
}
