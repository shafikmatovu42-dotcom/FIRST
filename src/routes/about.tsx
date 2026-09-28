import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SHOP } from "@/lib/shop";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-medium tracking-widest text-steel uppercase">
        About
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        A dedicated tool station, built for quality.
      </h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          TOOL HUB is a Kampala hardware and tool desk for industrial spanners, hydraulic jacks,
          digital multimeters, piston ring squeezers, combination sets and workshop equipment.
          All items are checked on the shelf and priced transparently in UGX.
        </p>
        <p>
          Durability is the whole job. Send a photo or specifications of the tool you need on WhatsApp.
          We confirm stock and grade before you travel.
        </p>
        <p>
          The shop counter is located at {SHOP.address}. {SHOP.hoursWeek}. {SHOP.hoursSunday}.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/shop" search={{}}>
            Browse the catalog
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/contact">Hours and map</Link>
        </Button>
      </div>
    </div>
  );
}
