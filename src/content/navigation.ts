import type { TKey } from "@/lib/i18n";

/** Section anchors shared by the navbar and footer. */
export const navLinks: { href: string; key: TKey }[] = [
  { href: "#how-to-play", key: "nav.howto" },
  { href: "#tournaments", key: "nav.tournaments" },
  { href: "/shop", key: "nav.shop" },
];
