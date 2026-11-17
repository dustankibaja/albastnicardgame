import type { TKey } from "@/lib/i18n";

/**
 * Section anchors shared by the navbar and footer. Root-relative, so they
 * carry a visitor back to the homepage section from /shop instead of being
 * dead links on a page where those sections do not exist.
 */
export const navLinks: { href: string; key: TKey }[] = [
  { href: "/#how-to-play", key: "nav.howto" },
  { href: "/#tournaments", key: "nav.tournaments" },
  { href: "/shop", key: "nav.shop" },
];
