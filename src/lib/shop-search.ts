export type ShopSearch = {
  q?: string;
  cat?: string;
  make?: string;
};

export function parseShopSearch(s: Record<string, unknown>): ShopSearch {
  const next: ShopSearch = {};
  if (typeof s.q === "string" && s.q) next.q = s.q;
  if (typeof s.cat === "string" && s.cat) next.cat = s.cat;
  if (typeof s.make === "string" && s.make) next.make = s.make;
  return next;
}

export function shopSearch(partial: ShopSearch): ShopSearch {
  return parseShopSearch(partial);
}
