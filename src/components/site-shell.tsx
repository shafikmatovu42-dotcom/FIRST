import { Outlet, Link } from "@tanstack/react-router";
import { LayoutGrid, Phone, ShoppingCart } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { SHOP, whatsappUrl } from "@/lib/shop";

export function SiteShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <a
        href={whatsappUrl(
          "Hello TOOL HUB, I am looking for a spare part. Can you help?",
        )}
        target="_blank"
        rel="noreferrer"
        className="fixed right-4 bottom-28 z-40 hidden size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-border-hover)] md:flex"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="size-6" />
      </a>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card md:hidden">
        <Link
          to="/shop"
          search={{}}
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <LayoutGrid className="size-4" />
          Shop
        </Link>
        <Link
          to="/cart"
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <ShoppingCart className="size-4" />
          Cart
        </Link>
        <a
          href={whatsappUrl("Hello TOOL HUB, I need a spare part.")}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp
        </a>
        <a
          href={`tel:${SHOP.phoneTel}`}
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <Phone className="size-4" />
          Call
        </a>
      </nav>
    </div>
  );
}
