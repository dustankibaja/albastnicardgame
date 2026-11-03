/**
 * Site-level facts used by metadata. Only verified values.
 *
 * `url`: the production origin (e.g. "https://<official-domain>"). NOT verified
 * yet: the Vercel address is a preview. Set VITE_SITE_URL at build time once
 * the official domain is confirmed. While unset, canonical / og:url / sitemap /
 * JSON-LD are omitted rather than guessed.
 *
 * `ogImage`: approved social-preview artwork (1200×630). None approved yet, so
 * previews use the text-only "summary" card. See docs/ASSET-SPECS.md.
 */
const envUrl = (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/+$/, "");

export const site = {
  name: "Albastini",
  url: envUrl && /^https:\/\//.test(envUrl) ? envUrl : null,
  locale: "en_TZ",
  alternateLocale: "sw_TZ",
  ogImage: null as null | { path: string; width: number; height: number; alt: string },
};
