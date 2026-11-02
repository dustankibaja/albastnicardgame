import { images, type ImageSet } from "./images.generated";

/**
 * ASSET REGISTRY — provenance of every image the site shows.
 *
 * Layout code references these ids, never file paths, so official scans can
 * replace a source file (then `node scripts/optimize-images.mjs`) without
 * touching any component.
 *
 * provenance:
 *  - "supplied-original"  supplied to the project as an original Albastini card front
 *  - "product-photo"      real Albastini product/packaging photography
 *  - "app-screenshot"     real app screenshot (cropped to remove personal account data)
 *  - "brand-artwork"      Albastini brand artwork (card fan + crown mark)
 *
 * Phase 2 note: the brief mentions new isolated card references, some
 * AI-reconstructed from photographs. Those were NOT received in this session,
 * so none are used. If they are added, register them here as
 * "reference-temporary" and never use them to state rules or card details.
 *
 * Known limits: card images are ~500px wide crops (partial card faces). They
 * are displayed at ≤ 250 CSS px so they stay sharp; full-resolution scans are
 * needed for larger card presentations.
 */
export type Provenance =
  | "supplied-original"
  | "product-photo"
  | "app-screenshot"
  | "brand-artwork"
  | "reference-temporary";

export type SiteImage = { image: ImageSet; provenance: Provenance };

export const siteImages = {
  aceRed: { image: images.cardRed, provenance: "supplied-original" },
  aceBlack: { image: images.cardBlack, provenance: "supplied-original" },
  aceBlue: { image: images.cardBlue, provenance: "supplied-original" },
  cardFan: { image: images.cardFan, provenance: "brand-artwork" },
  boxSafari: { image: images.boxSafari, provenance: "product-photo" },
  boxExpansion: { image: images.boxExpansion, provenance: "product-photo" },
  appHome: { image: images.appHome, provenance: "app-screenshot" },
} satisfies Record<string, SiteImage>;

export type SiteImageId = keyof typeof siteImages;
