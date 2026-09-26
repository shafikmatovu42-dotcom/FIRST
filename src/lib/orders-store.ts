import type { CartItem } from "@/lib/cart-store";

export type PayMethod = "mtn" | "airtel" | "pickup" | "whatsapp";

export type GuestOrder = {
  ref: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  method: PayMethod;
  name: string;
  phone: string;
  note: string;
  fulfilment: "pickup" | "boda";
};

const KEY = "toolhub-orders";

export function readOrders(): GuestOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: GuestOrder): void {
  const next = [order, ...readOrders()].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getOrder(ref: string): GuestOrder | undefined {
  return readOrders().find((o) => o.ref === ref);
}
