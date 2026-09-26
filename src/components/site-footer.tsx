import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SHOP } from "@/lib/shop";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-semibold tracking-wide">
            {SHOP.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {SHOP.tagline} Headlamps, body parts, oils and workshop gear — ready
            for pickup in Nakawa.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-steel uppercase">
            Shop
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/shop" search={{}} className="hover:text-steel">
                All parts
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ cat: "headlamps" }} className="hover:text-steel">
                Headlamps
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ cat: "taillamps" }} className="hover:text-steel">
                Taillamps
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-steel">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-steel uppercase">
            Contact
          </p>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={`tel:${SHOP.phoneTel}`} className="text-foreground">
                {SHOP.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${SHOP.email}`} className="text-foreground">
                {SHOP.email}
              </a>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{SHOP.address}</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-steel uppercase">
            Hours
          </p>
          <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0" />
            <span>
              {SHOP.hoursWeek}
              <br />
              {SHOP.hoursSunday}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
