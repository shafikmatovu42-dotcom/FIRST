import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SHOP } from "@/lib/shop";
import { getPublicShopSettings } from "@/lib/catalog";

type FooterInfo = {
  name: string;
  tagline: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  address: string;
  hoursWeek: string;
};

export function SiteFooter() {
  const [info, setInfo] = useState<FooterInfo>({
    name: SHOP.name,
    tagline: SHOP.tagline,
    phoneDisplay: SHOP.phoneDisplay,
    phoneTel: SHOP.phoneTel,
    email: SHOP.email,
    address: SHOP.address,
    hoursWeek: SHOP.hoursWeek,
  });

  useEffect(() => {
    void (async () => {
      try {
        const s = await getPublicShopSettings();
        setInfo({
          name: s.store_name || SHOP.name,
          tagline: s.hero_subtitle || SHOP.tagline,
          phoneDisplay: s.store_phone || SHOP.phoneDisplay,
          phoneTel: s.store_phone || SHOP.phoneTel,
          email: s.store_email || SHOP.email,
          address: s.store_address || SHOP.address,
          hoursWeek: s.store_hours || SHOP.hoursWeek,
        });
      } catch {
        // Fallback to defaults
      }
    })();
  }, []);

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-semibold tracking-wide">
            {info.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {info.tagline}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-steel uppercase">
            Shop
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/shop" search={{}} className="hover:text-steel">
                All tools
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ cat: "spanners" }} className="hover:text-steel">
                Spanners
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ cat: "jacks" }} className="hover:text-steel">
                Hydraulic Jacks
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
              <a href={`tel:${info.phoneTel}`} className="text-foreground">
                {info.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${info.email}`} className="text-foreground">
                {info.email}
              </a>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{info.address}</span>
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
              {info.hoursWeek}
              <br />
              {SHOP.hoursSunday}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
