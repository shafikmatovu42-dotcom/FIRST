import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/catalog";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  brand: string;
  price_ugx: number;
  image: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1) => {
        const items = [...get().items];
        const i = items.findIndex((x) => x.productId === product.id);
        if (i >= 0) {
          items[i] = { ...items[i], qty: items[i].qty + qty };
        } else {
          items.push({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            price_ugx: product.price_ugx,
            image: product.image,
            qty,
          });
        }
        set({ items });
      },
      setQty: (productId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((x) => x.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((x) =>
            x.productId === productId ? { ...x, qty } : x,
          ),
        });
      },
      remove: (productId) =>
        set({ items: get().items.filter((x) => x.productId !== productId) }),
      clear: () => set({ items: [] }),
    }),
    { name: "toolhub-cart" },
  ),
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.price_ugx * i.qty, 0);
}

export function cartWhatsAppText(items: CartItem[]): string {
  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — UGX ${i.price_ugx.toLocaleString("en-US")}`,
  );
  const total = cartTotal(items).toLocaleString("en-US");
  return `Hello TOOL HUB, I would like to order:\n${lines.join("\n")}\n\nTotal: UGX ${total}`;
}
