import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone, Shield, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { listCategories, listHotProducts } from "@/lib/catalog";
import { SHOP, whatsappUrl } from "@/lib/shop";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [categories, hot] = await Promise.all([
      listCategories(),
      listHotProducts(),
    ]);
    return { categories, hot };
  },
  component: Home,
});

function Home() {
  const { categories, hot } = Route.useLoaderData();

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src="/parts/workshop.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-background/75" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:py-28">
          <p className="text-xs font-medium tracking-[0.2em] text-steel uppercase">
            Nakawa, Kampala
          </p>
          <h1 className="font-display max-w-3xl text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
            Japanese and European parts. On the shelf.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {SHOP.tagline} Headlamps, taillamps, grills and workshop fluids —
            priced in UGX, ready for pickup or WhatsApp order.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/shop" search={{}}>
                Browse parts
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={whatsappUrl(
                  "Hello TOOL HUB, I need a spare part. I will send the vehicle details.",
                )}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon className="size-4" />
                Order on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-steel uppercase">
              Categories
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">
              What we stock
            </h2>
          </div>
          <Button variant="link" asChild className="hidden sm:inline-flex">
            <Link to="/shop" search={{}}>
              All parts
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ cat: c.slug }}
              className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <p className="font-display text-xl font-semibold tracking-tight">
                {c.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-steel uppercase">
              Hot
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">
              Moving this week
            </h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hot.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
          <div className="flex gap-3">
            <Shield className="mt-0.5 size-5 text-steel" />
            <div>
              <p className="font-medium">OEM and aftermarket</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Grade is marked on every card so you know what you are buying.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Truck className="mt-0.5 size-5 text-steel" />
            <div>
              <p className="font-medium">Pickup same day</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nakawa counter is open six days. Boda dispatch on request.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 size-5 text-steel" />
            <div>
              <p className="font-medium">Talk before you travel</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send the chassis, year and a photo. We confirm fitment on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <MapPin className="mt-1 size-5 text-steel" />
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">
              {SHOP.address}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {SHOP.hoursWeek}. {SHOP.hoursSunday}.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to="/contact">Visit the shop</Link>
        </Button>
      </section>
    </div>
  );
}
