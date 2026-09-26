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
        A parts counter, not a marketplace.
      </h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          TOOL HUB is a Kampala spare-parts desk for Japanese and European
          vehicles. We buy the way the market actually works: lamps, body panels,
          oils and the odd workshop tool — checked on the shelf, priced in UGX.
        </p>
        <p>
          Fitment is the whole job. Send the year, chassis and a photo of the old
          part. We will tell you OEM versus aftermarket before you ride to Nakawa.
        </p>
        <p>
          The shop floor is {SHOP.address}. {SHOP.hoursWeek}. {SHOP.hoursSunday}.
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
