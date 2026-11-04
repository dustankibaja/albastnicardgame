import { images, type ImageSet } from "./images.generated";

/**
 * ASSET REGISTRY — provenance for every image the site can show.
 *
 * Components reference ids, never file paths. To replace an asset with a
 * genuine scan/photo: put the file in src/assets/, add/adjust its job in
 * scripts/optimize-images.mjs, run `node scripts/optimize-images.mjs`, point
 * the entry's `image` at it and update `provenance`. No layout changes.
 *
 * provenance (never silently promote an entry to a stronger status):
 *  - "official"                    Albastini-owned artwork used in official products
 *  - "real_source_photo"           genuine photograph/screenshot of the real product/app
 *  - "approved_public"             cleared for public use (people, venues, events)
 *  - "temporary_reference"         provenance unconfirmed; replace with genuine source
 *  - "ai_reconstructed_reference"  reconstructed from a photo; never establishes card details
 *
 * Owner-approved temporary card pack (8 reconstructed fronts + 1 back) is kept
 * in assets-source/temporary-cards/ as "ai_reconstructed_reference". It is not
 * registered here because nothing uses it yet (registered images ship).
 */
export type Provenance =
  | "official"
  | "real_source_photo"
  | "approved_public"
  | "temporary_reference"
  | "ai_reconstructed_reference";

export type SiteImage = {
  /** null = slot awaiting a genuine asset; components render nothing */
  image: ImageSet | null;
  provenance: Provenance | "awaiting";
  note: string;
};

export const siteImages = {
  aceRed: {
    image: images.cardRed,
    provenance: "temporary_reference",
    note: "Isolated red ace (partial face crop). Paper texture suggests a photo crop, but whether it is a genuine scan or a reconstruction is unconfirmed. Replace with an official scan.",
  },
  aceBlack: {
    image: images.cardBlack,
    provenance: "temporary_reference",
    note: "Isolated black ace cut-out (partial face). Clean cut-out; possibly reconstructed. Unconfirmed. Replace with an official scan.",
  },
  aceBlue: {
    image: images.cardBlue,
    provenance: "temporary_reference",
    note: "Isolated blue ace (partial face crop). Unconfirmed provenance. Replace with an official scan.",
  },
  cardFan: {
    image: images.cardFan,
    provenance: "official",
    note: "Official Albastini brand mark source (2048 px, final handoff). Card fan + crown.",
  },
  brandMark: {
    image: images.brandMark,
    provenance: "official",
    note: "Official Albastini brand mark source (final handoff); navbar, menu and footer mark.",
  },
  bedadiPortrait: {
    image: images.bedadiPortrait,
    provenance: "real_source_photo",
    note: "Genuine photo of Bedadi (Tournament #26, 2nd). Used whole; framed by CSS (cover). No edits.",
  },
  jeshiPortrait: {
    image: images.jeshiPortrait,
    provenance: "real_source_photo",
    note: "Genuine photo of Jeshi (Tournament #26, 3rd), separated from the official poster (the only source supplied) with an alpha matte; poster text/graphics excluded. No regeneration.",
  },
  boxSafari: {
    image: images.boxSafari,
    provenance: "real_source_photo",
    note: "Safari Edition retail box, real product photography (onboarding brief §8).",
  },
  boxDetail: {
    image: null,
    provenance: "awaiting",
    note: "Detail crop of the product. Needs a high-resolution product photo: the current 600px box photo goes soft when magnified.",
  },
  boxExpansion: {
    image: images.boxExpansion,
    provenance: "real_source_photo",
    note: "Safari Edition Expansion Pack box, real product photography.",
  },
  appHome: {
    image: images.appHome,
    provenance: "real_source_photo",
    note: "Genuine app home screenshot, cropped below the personal profile bar.",
  },

  /* ---- Slots awaiting genuine assets (render nothing until filled) ---- */
  davidSanyaPortrait: {
    image: images.davidSanyaPortrait,
    provenance: "real_source_photo",
    note: "Genuine photograph of David Sanya (project owner, Phase 4). Derivative: crop, alpha-matte background separation, uniform gamma lift. No regeneration. See assets-source/phase4/DERIVATIVES.md.",
  },
  cardsOnTable: {
    image: images.cardsOnTable,
    provenance: "real_source_photo",
    note: "Genuine photo of Albastini cards fanned on a wooden table (shows card backs). Crop only. Not an official scan.",
  },
  cardFrontsOnWhite: {
    image: images.cardFrontsOnWhite,
    provenance: "real_source_photo",
    note: "Genuine product photo of nine card fronts on white, shot at an angle. Crop only. Not official isolated scans; never extract/reconstruct cards from it.",
  },
  communityPlay: {
    image: null,
    provenance: "awaiting",
    note: "Cleared (approved_public) community photo of real play. None cleared yet.",
  },
} satisfies Record<string, SiteImage>;

export type SiteImageId = keyof typeof siteImages;

export function hasImage(id: SiteImageId) {
  return siteImages[id].image !== null;
}
