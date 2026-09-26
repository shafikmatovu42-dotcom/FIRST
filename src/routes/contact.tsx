import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { SHOP, whatsappUrl } from "@/lib/shop";
import { getPublicShopSettings } from "@/lib/catalog";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    const dbSettings = await getPublicShopSettings();
    return { dbSettings };
  },
  component: ContactPage,
});

function ContactPage() {
  const { dbSettings } = Route.useLoaderData();

  const storeName = dbSettings.store_name || SHOP.name;
  const storePhone = dbSettings.store_phone || SHOP.phoneDisplay;
  const phoneTel = dbSettings.store_phone || SHOP.phoneTel;
  const storeWhatsapp = dbSettings.store_whatsapp || SHOP.whatsapp;
  const storeEmail = dbSettings.store_email || SHOP.email;
  const storeAddress = dbSettings.store_address || SHOP.address;
  const storeHours = dbSettings.store_hours || SHOP.hoursWeek;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs font-medium tracking-widest text-steel uppercase">
        Contact
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
        Talk to the counter
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Call, WhatsApp, or walk in. Have the vehicle year and a photo of the part
        if you can — it saves a return trip.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <Phone className="size-5 text-steel" />
          <p className="mt-4 text-sm text-muted-foreground">Phone</p>
          <a href={`tel:${phoneTel}`} className="font-display text-2xl font-semibold">
            {storePhone}
          </a>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <Mail className="size-5 text-steel" />
          <p className="mt-4 text-sm text-muted-foreground">Email</p>
          <a href={`mailto:${storeEmail}`} className="font-display text-2xl font-semibold">
            {storeEmail}
          </a>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <MapPin className="size-5 text-steel" />
          <p className="mt-4 text-sm text-muted-foreground">Shop</p>
          <p className="font-display text-2xl font-semibold">{storeAddress}</p>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <Clock className="size-5 text-steel" />
          <p className="mt-4 text-sm text-muted-foreground">Hours</p>
          <p className="font-display text-2xl font-semibold leading-tight">
            {storeHours}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{SHOP.hoursSunday}</p>
        </div>
      </div>

      <Button asChild size="lg" className="mt-8">
        <a
          href={whatsappUrl(
            `Hello ${storeName}, I am at the counter in spirit. I need a part.`,
            storeWhatsapp
          )}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp the shop
        </a>
      </Button>
    </div>
  );
}
