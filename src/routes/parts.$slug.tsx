import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Minus, Plus, Phone } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import {
  getProductBySlug,
  listRelatedProducts,
  getPublicShopSettings,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { formatUgx } from "@/lib/format";
import { SHOP, whatsappUrl } from "@/lib/shop";

export const Route = createFileRoute("/parts/$slug")({
  loader: async ({ params }) => {
    const [product, dbSettings] = await Promise.all([
      getProductBySlug({ data: { slug: params.slug } }),
      getPublicShopSettings(),
    ]);
    if (!product) throw notFound();
    const related = await listRelatedProducts({
      data: { slug: product.slug, category: product.category_slug },
    });
    return { product, related, dbSettings };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) return {};
    const { product } = loaderData;
    const title = `${product.name} — ${product.brand} | TOOL HUB Kampala`;
    const description = `${product.description} Price: UGX ${product.price_ugx.toLocaleString()}. Grade: ${product.grade}. Specs: ${product.fitment || "Hardware Tool / Workshop Equipment"}. Pickup in Nakawa / Kiseka, Kampala.`;
    const image = product.image.startsWith("http") ? product.image : `https://toolhub.ug${product.image}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": [image],
      "description": product.description,
      "sku": product.slug,
      "brand": {
        "@type": "Brand",
        "name": product.brand,
      },
      "offers": {
        "@type": "Offer",
        "url": `https://toolhub.ug/parts/${product.slug}`,
        "priceCurrency": "UGX",
        "price": product.price_ugx,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": product.grade === "OEM" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
      },
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `https://toolhub.ug/parts/${product.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [
        { rel: "canonical", href: `https://toolhub.ug/parts/${product.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="font-display text-3xl font-semibold">Part not listed</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That slug is not in the catalog.
      </p>
      <Button asChild className="mt-6">
        <Link to="/shop" search={{}}>
          Back to shop
        </Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related, dbSettings } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  const whatsappNum = dbSettings.store_whatsapp || SHOP.whatsapp;
  const phoneDisplay = dbSettings.store_phone || SHOP.phoneDisplay;
  const phoneTel = dbSettings.store_phone || SHOP.phoneTel;

  const message = `Hello ${dbSettings.store_name || SHOP.name}, I want ${product.name} (${formatUgx(product.price_ugx)}). Is it in stock?`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Toaster theme="dark" position="top-center" />
      <p className="text-sm text-muted-foreground">
        <Link to="/shop" search={{ cat: product.category_slug }} className="hover:text-foreground">
          {product.category_slug.replace("-", " ")}
        </Link>
        <span className="mx-2">/</span>
        {product.name}
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/parts/headlamp.jpg";
            }}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {product.hot ? <Badge variant="hot">Hot</Badge> : null}
            <Badge variant="steel">{product.grade}</Badge>
            <Badge variant={product.stock > 3 ? "stock" : "outline"}>
              {product.stock > 0 ? `${product.stock} in store` : "Ask on WhatsApp"}
            </Badge>
          </div>
          <p className="mt-4 text-xs font-medium tracking-widest text-steel uppercase">
            {product.brand}
            {product.make ? ` · ${product.make}` : ""}
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            {product.name}
          </h1>
          {product.fitment ? (
            <p className="mt-2 text-muted-foreground">Fits {product.fitment}</p>
          ) : null}
          <p className="mt-6 text-3xl font-medium tabular-nums">
            {formatUgx(product.price_ugx)}
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex h-11 items-center rounded-md bg-elevated shadow-[var(--shadow-border)]">
              <button
                type="button"
                className="flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center tabular-nums">{qty}</span>
              <button
                type="button"
                className="flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => setQty((n) => n + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button
              onClick={() => {
                add(product, qty);
                toast.success("Added to cart");
              }}
            >
              Add to cart
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href={whatsappUrl(message, whatsappNum)} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="size-4" />
                Ask on WhatsApp
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href={`tel:${phoneTel}`}>
                <Phone className="size-4" />
                {phoneDisplay}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Same bay
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
