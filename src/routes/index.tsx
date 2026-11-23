import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone, Shield, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getHeroSettings, listHotProducts } from "@/lib/catalog";
import { SHOP, whatsappUrl } from "@/lib/shop";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [hot, heroSettings] = await Promise.all([
      listHotProducts(),
      getHeroSettings(),
    ]);
    return { hot, heroSettings };
  },
  component: Home,
});

/**
 * Isolated hero slideshow:
 * - Only downloads slide #1 initially (never all 5 at once).
 * - Loads subsequent slides on-demand right when transitioning to them.
 * - Pauses timer when scrolled out of view or when browser tab is hidden.
 * - Keeps slide ticks isolated so the rest of the homepage doesn't re-render.
 */
function HeroSlideshow({
  images,
  locationTag,
  heroTitle,
  heroSubtitle,
  whatsappNum,
}: {
  images: string[];
  locationTag: string;
  heroTitle: string;
  heroSubtitle: string;
  whatsappNum: string;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<number[]>([0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(Boolean(entries[0]?.isIntersecting));
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (images.length <= 1 || !isVisible) return;

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setCurrentSlide((prev) => {
        const next = (prev + 1) % images.length;
        setLoadedIndices((loaded) =>
          loaded.includes(next) ? loaded : [...loaded, next],
        );
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length, isVisible]);

  const goToSlide = (idx: number) => {
    setLoadedIndices((loaded) =>
      loaded.includes(idx) ? loaded : [...loaded, idx],
    );
    setCurrentSlide(idx);
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[420px] overflow-hidden bg-elevated"
    >
      {images.map((img, idx) => {
        if (!loadedIndices.includes(idx)) return null;
        return (
          <img
            key={idx}
            src={img}
            alt={`Tool Hub background slide ${idx + 1}`}
            loading={idx === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={idx === 0 ? "high" : "low"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/parts/workshop.jpg";
            }}
            className={`absolute inset-0 size-full object-cover transition-all duration-1000 ease-in-out ${
              idx === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
          />
        );
      })}

      {/* Lightened gradient overlay to show vibrant clear background photos */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/30" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:py-28">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-500 uppercase">
          {locationTag}
        </p>
        <h1 className="font-display max-w-3xl text-5xl leading-[0.95] font-semibold tracking-tight text-foreground sm:text-7xl">
          {heroTitle}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {heroSubtitle}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/shop" search={{}}>
              Browse tools
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a
              href={whatsappUrl(
                "Hello TOOL HUB, I need a tool. I will send the specifications.",
                whatsappNum,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon className="size-4" />
              Order on WhatsApp
            </a>
          </Button>
        </div>

        {/* Slide Indicator Dots */}
        {images.length > 1 && (
          <div className="mt-4 flex items-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "w-8 bg-amber-500"
                    : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Home() {
  const { hot, heroSettings } = Route.useLoaderData();
  const { categories, settings: siteSettings } = useLoaderData({ from: "__root__" });

  const heroImages = [
    heroSettings.hero_image_1 || heroSettings.hero_image || "/parts/workshop.jpg",
    heroSettings.hero_image_2 || "/parts/headlamp.jpg",
    heroSettings.hero_image_3 || "/parts/grill.jpg",
    heroSettings.hero_image_4 || "/parts/jack.jpg",
    heroSettings.hero_image_5 || "/parts/lubricant.jpg",
  ].filter(Boolean);

  const locationTag =
    heroSettings.hero_location_tag || siteSettings.store_address || SHOP.city;
  const heroTitle =
    heroSettings.hero_title || "Quality spanners, jacks & hardware tools.";
  const heroSubtitle =
    heroSettings.hero_subtitle ||
    "Your number one tool station for quality spanners, hydraulic jacks, multimeters, socket sets and workshop equipment — priced in UGX.";
  const whatsappNum = siteSettings.store_whatsapp || SHOP.whatsapp;
  const storeAddress = siteSettings.store_address || SHOP.address;
  const storeHours = siteSettings.store_hours || SHOP.hoursWeek;

  return (
    <div>
      <HeroSlideshow
        images={heroImages}
        locationTag={locationTag}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        whatsappNum={whatsappNum}
      />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-amber-500 uppercase">
              Categories
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">
              What we stock
            </h2>
          </div>
          <Button variant="link" asChild className="hidden sm:inline-flex">
            <Link to="/shop" search={{}}>
              All tools
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
            <p className="text-xs font-semibold tracking-widest text-amber-500 uppercase">
              Hot Tools
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
            <Shield className="mt-0.5 size-5 text-amber-500" />
            <div>
              <p className="font-medium">Heavy Duty & Standard Grade</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Grade is marked on every tool so you know what you are buying.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Truck className="mt-0.5 size-5 text-amber-500" />
            <div>
              <p className="font-medium">Pickup same day</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nakawa counter is open six days. Boda dispatch on request.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 size-5 text-amber-500" />
            <div>
              <p className="font-medium">Talk before you travel</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send a photo or specs of the tool you need. We confirm stock on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <MapPin className="mt-1 size-5 text-amber-500" />
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">
              {storeAddress}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {storeHours}. {SHOP.hoursSunday}.
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
