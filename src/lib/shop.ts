export const SHOP = {
  name: "TOOL HUB",
  shortName: "Tool Hub",
  tagline: "Spare parts for Japanese and European vehicles.",
  phoneDisplay: "0750 441 220",
  phoneTel: "+256750441220",
  whatsapp: "256750441220",
  email: "sales@toolhub.ug",
  address: "Unit 8, Nakawa Industrial Area, Kampala",
  hoursWeek: "Monday – Saturday, 08:00 – 18:00",
  hoursSunday: "Sunday closed",
  city: "Kampala",
} as const;

export function whatsappUrl(text: string): string {
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
}
