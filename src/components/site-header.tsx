import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, Search, ShoppingCart, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cartCount, useCart } from "@/lib/cart-store";
import { shopSearch } from "@/lib/shop-search";
import { SHOP } from "@/lib/shop";

const LINKS: {
  to: "/" | "/shop" | "/about" | "/contact";
  label: string;
  cat?: string;
}[] = [
  { to: "/shop", label: "All parts" },
  { to: "/shop", label: "Headlamps", cat: "headlamps" },
  { to: "/shop", label: "Taillamps", cat: "taillamps" },
  { to: "/shop", label: "Body parts", cat: "body-parts" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/admin" as any, label: "Owner Portal" },
];

export function SiteHeader() {
  const items = useCart((s) => s.items);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const count = ready ? cartCount(items) : 0;

  useEffect(() => setReady(true), []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    void navigate({
      to: "/shop",
      search: shopSearch({ q: q.trim() }),
    });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="hidden border-b border-border bg-elevated md:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
          <p>
            {SHOP.city} · {SHOP.hoursWeek}
          </p>
          <a
            href={`tel:${SHOP.phoneTel}`}
            className="inline-flex items-center gap-1.5 text-foreground hover:text-steel"
          >
            <Phone className="size-3.5" />
            {SHOP.phoneDisplay}
          </a>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wrench className="size-4" />
          </span>
          <span className="font-display text-xl leading-none font-semibold tracking-wide">
            {SHOP.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {LINKS.map((item) =>
            item.to === "/shop" ? (
              <Link
                key={item.label}
                to="/shop"
                search={shopSearch({ cat: item.cat })}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <form
          onSubmit={onSearch}
          className="ml-auto hidden min-w-0 max-w-sm flex-1 md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Hilux, Premio, lamp…"
              className="h-10 pl-9"
              aria-label="Search parts"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart" aria-label="Cart">
              <span className="relative">
                <ShoppingCart className="size-5" />
                {count > 0 ? (
                  <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-semibold text-primary-foreground tabular-nums">
                    {count}
                  </span>
                ) : null}
              </span>
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{SHOP.name}</SheetTitle>
              </SheetHeader>
              <form onSubmit={onSearch} className="mt-6">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search parts"
                  aria-label="Search parts"
                />
              </form>
              <nav className="mt-6 flex flex-col gap-1">
                {LINKS.map((item) =>
                  item.to === "/shop" ? (
                    <Link
                      key={item.label}
                      to="/shop"
                      search={shopSearch({ cat: item.cat })}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-2 py-3 text-base text-foreground hover:bg-elevated"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-2 py-3 text-base text-foreground hover:bg-elevated"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <a
                  href={`tel:${SHOP.phoneTel}`}
                  className="rounded-md px-2 py-3 text-base text-foreground hover:bg-elevated"
                >
                  Call {SHOP.phoneDisplay}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
