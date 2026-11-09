import type { SiteImageId } from "./assets";
import type { TKey } from "@/lib/i18n";

/**
 * WINNERS — verified records only.
 *
 * `displayName` is the player name used in the Albastini app. It is NOT a
 * legal name; never research or publish legal names.
 * Prizes are NOT stored per winner: they derive from `placement` via the
 * central prize structure below, so they can never disagree.
 */

export type Placement = 1 | 2 | 3;

/** Recurring tournament prizes, Tanzanian shillings. Change here only. */
export const tournamentPrizeStructure: Record<Placement, number> = {
  1: 130000,
  2: 65000,
  3: 26000,
};

export type Winner = {
  id: string;
  displayName: string;
  placement: Placement;
  location: string;
  /** Links to content/tournaments.ts. Required: winners are grouped by tournament. */
  tournamentId: string;
  /** Genuine photo from the asset registry. Omit if none: the frame shows a typographic state. */
  portrait?: SiteImageId;
  portraitAltKey?: TKey;
  /**
   * Photo mode for ChampionFrame (M1):
   *  - "portrait-cutout": a figure extracted from its background, rising out of the frame.
   *  - "editorial-photo": a scene kept whole (the environment is part of the photograph).
   */
  photoMode?: "portrait-cutout" | "editorial-photo";
  /** "cover" when cropping is safe; "contain" when cropping would cut important content. */
  imageFit?: "cover" | "contain";
  /** CSS object-position, e.g. "50% 30%". */
  imagePosition?: string;
};

export function prizeFor(placement: Placement) {
  return tournamentPrizeStructure[placement];
}

/** "130,000 TSH" — fixed format so server and client render identically. */
export function formatPrize(amount: number) {
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} TSH`;
}

export const winners: Winner[] = [
  // Tournament #26 — 26 September 2026 — verified by the official posters.
  {
    id: "t26-1-david-sanya",
    displayName: "David Sanya",
    placement: 1,
    location: "Dar es Salaam, Tanzania",
    tournamentId: "tournament-26",
    portrait: "davidSanyaPortrait",
    photoMode: "portrait-cutout",
    portraitAltKey: "alt.david",
    imageFit: "contain",
    imagePosition: "50% 100%",
  },
  {
    id: "t26-2-bedadi",
    displayName: "Bedadi",
    placement: 2,
    location: "Kilimanjaro, Tanzania",
    tournamentId: "tournament-26",
    portrait: "bedadiPortrait",
    photoMode: "editorial-photo",
    portraitAltKey: "alt.bedadi",
    imageFit: "cover",
    imagePosition: "55% 30%",
  },
  {
    // Display name confirmed by the project owner (Albastini app name).
    id: "t26-3-mjeshi",
    displayName: "MJeshi",
    placement: 3,
    location: "Iringa, Tanzania",
    tournamentId: "tournament-26",
    portrait: "mjeshiPortrait",
    photoMode: "portrait-cutout",
    portraitAltKey: "alt.mjeshi",
    // Near-square cut-out: "cover" (bottom-anchored) only trims jacket edges
    // and gives him the same presence as the other champions.
    imageFit: "cover",
    imagePosition: "50% 100%",
  },
];
