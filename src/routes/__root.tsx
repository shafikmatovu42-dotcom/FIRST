import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { SiteShell } from "@/components/site-shell";
import { SHOP } from "@/lib/shop";
import appCss from "../styles.css?url";

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  "name": "TOOL HUB",
  "image": "https://toolhub.ug/og.jpg",
  "@id": "https://toolhub.ug/#store",
  "url": "https://toolhub.ug",
  "telephone": "+256750441220",
  "priceRange": "UGX 10,000 - 5,000,000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Nakawa Industrial Area / Kiseka Market",
    "addressLocality": "Kampala",
    "addressCountry": "UG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "0.3308",
    "longitude": "32.6139"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "08:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://wa.me/256750441220"
  ]
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: `${SHOP.name} — Quality Spanners, Hydraulic Jacks & Hardware Tools in Kampala` },
      {
        name: "description",
        content:
          "TOOL HUB supplies quality spanners, hydraulic jacks, multimeters, socket sets and workshop equipment in Kampala. Pickup in Nakawa / Kiseka or order on WhatsApp.",
      },
      {
        name: "keywords",
        content:
          "TOOL HUB, spanners, hydraulic jacks, multimeters, combination set, box spanner, piston ring squeezer, hardware tools, workshop equipment, Kampala, Kiseka market, Uganda tools",
      },
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0b0b0c" },
      { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#f8fafc" },

      // Open Graph / Facebook / WhatsApp Preview Card
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SHOP.name },
      { property: "og:title", content: `${SHOP.name} — Quality Spanners, Jacks & Workshop Tools` },
      { property: "og:description", content: "Find quality spanners, hydraulic jacks, multimeters, socket sets and garage equipment in Kampala. Instant WhatsApp ordering & pickup." },
      { property: "og:image", content: "https://toolhub.ug/og.jpg" },
      { property: "og:url", content: "https://toolhub.ug/" },

      // Twitter Cards
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${SHOP.name} — Hardware & Workshop Tools Kampala` },
      { name: "twitter:description", content: "Quality spanners, jacks and workshop equipment on the shelf. Pickup in Kampala or WhatsApp order." },
      { name: "twitter:image", content: "https://toolhub.ug/og.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: "https://toolhub.ug/" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLdData),
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <SiteShell />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
