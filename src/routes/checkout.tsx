import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cartTotal, cartWhatsAppText, useCart } from "@/lib/cart-store";
import { formatUgx, orderRef } from "@/lib/format";
import { type PayMethod, saveOrder } from "@/lib/orders-store";
import { SHOP, whatsappUrl } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { createOrder } from "@/lib/admin-orders";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const METHODS: { id: PayMethod; label: string; hint: string }[] = [
  { id: "mtn", label: "MTN Mobile Money", hint: "Demo prompt — no money is taken" },
  { id: "airtel", label: "Airtel Money", hint: "Demo prompt — no money is taken" },
  { id: "pickup", label: "Cash at pickup", hint: "Pay at the Nakawa counter" },
  { id: "whatsapp", label: "Finish on WhatsApp", hint: "We confirm stock, then you pay" },
];

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const total = cartTotal(items);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [fulfilment, setFulfilment] = useState<"pickup" | "boda">("pickup");
  const [method, setMethod] = useState<PayMethod>("pickup");
  const [step, setStep] = useState<"form" | "momo">("form");
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="font-display text-4xl font-semibold">Checkout</h1>
        <p className="mt-3 text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-6">
          <Link to="/shop" search={{}}>
            Browse parts
          </Link>
        </Button>
      </div>
    );
  }

  async function place(nextMethod: PayMethod) {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      setError("Name and phone are required.");
      return;
    }
    const ref = orderRef();

    // Persist to local storage
    saveOrder({
      ref,
      createdAt: new Date().toISOString(),
      items,
      total,
      method: nextMethod,
      name: trimmedName,
      phone: trimmedPhone,
      note: note.trim(),
      fulfilment,
    });

    // Persist to database for admin dashboard tracking
    try {
      await createOrder({
        data: {
          order_ref: ref,
          customer_name: trimmedName,
          customer_phone: trimmedPhone,
          delivery_location: fulfilment === "pickup" ? "Pickup in Nakawa" : "Boda Delivery Requested",
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            price_ugx: i.price_ugx,
            quantity: i.qty,
            image: i.image,
          })),
          total_ugx: total,
          notes: note.trim(),
        },
      });
    } catch (err) {
      console.warn("Failed to persist order to database:", err);
    }

    if (nextMethod === "whatsapp") {
      window.open(whatsappUrl(cartWhatsAppText(items) + `\n\nName: ${trimmedName}\nPhone: ${trimmedPhone}`), "_blank");
    }
    clear();
    void navigate({ to: "/order/$ref", params: { ref } });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (method === "mtn" || method === "airtel") {
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      if (!trimmedName || !trimmedPhone) {
        setError("Name and phone are required.");
        return;
      }
      setStep("momo");
      return;
    }
    place(method);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Guest checkout. Details stay on this device — we do not store them on a
        server. {SHOP.city} pickup at {SHOP.address}.
      </p>

      {step === "momo" ? (
        <div className="mt-8 rounded-xl bg-card p-6 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-widest text-steel uppercase">
            Demo payment
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold">
            {method === "mtn" ? "MTN" : "Airtel"} prompt
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            In a live shop this would send a {formatUgx(total)} request to{" "}
            <span className="text-foreground">{phone || "your number"}</span>.
            This preview never charges a wallet. Confirm to record the order.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => place(method)}>
              Confirm (demo)
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep("form")}>
              Back
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="07xx xxx xxx"
                autoComplete="tel"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Chassis number, left or right lamp, colour…"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Fulfilment</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["pickup", "Pickup in Nakawa"],
                  ["boda", "Ask us to arrange a boda"],
                ] as const
              ).map(([id, label]) => (
                <label
                  key={id}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center rounded-md px-3 text-sm shadow-[var(--shadow-border)]",
                    fulfilment === id ? "bg-primary text-primary-foreground" : "bg-elevated",
                  )}
                >
                  <input
                    type="radio"
                    name="fulfilment"
                    className="sr-only"
                    checked={fulfilment === id}
                    onChange={() => setFulfilment(id)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">Pay</legend>
            <div className="mt-3 grid gap-2">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-md px-3 py-3 shadow-[var(--shadow-border)]",
                    method === m.id ? "bg-primary text-primary-foreground" : "bg-elevated",
                  )}
                >
                  <input
                    type="radio"
                    name="method"
                    className="sr-only"
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                  />
                  <span className="text-sm font-medium">{m.label}</span>
                  <span
                    className={cn(
                      "text-xs",
                      method === m.id ? "opacity-80" : "text-muted-foreground",
                    )}
                  >
                    {m.hint}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-medium tabular-nums">{formatUgx(total)}</p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full sm:w-auto">
            Place order
          </Button>
        </form>
      )}
    </div>
  );
}
