import { useEffect, useState } from "react";
import { Outlet, Link } from "@tanstack/react-router";
import { LayoutGrid, Phone, ShoppingCart } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { SHOP, whatsappUrl } from "@/lib/shop";
import { getPublicShopSettings } from "@/lib/catalog";

export function SiteShell() {
  const [shopPhone, setShopPhone] = useState(SHOP.phoneTel);
  const [whatsappNum, setWhatsappNum] = useState(SHOP.whatsapp);

  useEffect(() => {
    void (async () => {
      try {
        const settings = await getPublicShopSettings();
        if (settings.store_whatsapp) setWhatsappNum(settings.store_whatsapp);
        if (settings.store_phone) setShopPhone(settings.store_phone);
      } catch {
        // Fallback to default
      }
    })();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <PwaInstallBanner />
      <SiteFooter />
      <a
        href={whatsappUrl(
          "Hello TOOL HUB, I am looking for a spare part. Can you help?",
          whatsappNum
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
          href={whatsappUrl("Hello TOOL HUB, I need a spare part.", whatsappNum)}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp
        </a>
        <a
          href={`tel:${shopPhone}`}
          className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <Phone className="size-4" />
          Call
        </a>
      </nav>
    </div>
  );
}
