export const SHOP = {
  name: "TOOL HUB",
  shortName: "Tool Hub",
  tagline: "Quality spanners, jacks, hand tools and workshop equipment.",
  phoneDisplay: "0750 441 220",
  phoneTel: "+256750441220",
  whatsapp: "256750441220",
  email: "sales@toolhub.ug",
  address: "Unit 8, Nakawa Industrial Area, Kampala",
  hoursWeek: "Monday – Saturday, 08:00 – 18:00",
  hoursSunday: "Sunday closed",
  city: "Kampala",
} as const;

export function whatsappUrl(text: string, overrideNumber?: string): string {
  const raw = overrideNumber || SHOP.whatsapp;
  const num = raw.replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
