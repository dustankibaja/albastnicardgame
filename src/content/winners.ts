/**
 * WINNERS — single source of truth.
 *
 * Only verified records. Never add a placeholder portrait: leave `image` out and
 * the UI renders a text-only record. To add a real photo later, put the file in
 * src/assets/winners/, import it here, and set `image` + `imageAlt`.
 */

import type { SiteImageId } from "./assets";

export type Winner = {
  id: string;
  name: string;
  /** 1 = first place. */
  position: number;
  location?: string;
  /** Display string exactly as verified, e.g. "TZS 130,000". */
  prize?: string;
  /**
   * Portrait from the asset registry (content/assets.ts). Only a genuine photo
   * of the winner. If the registry slot is still empty, the UI shows the
   * typographic record instead.
   */
  imageId?: SiteImageId;
  imageAlt?: string;
  /** Link to a record in content/tournaments.ts, only once verified. */
  tournamentId?: string;
};

export const winners: Winner[] = [
  {
    // Verified record. Tournament number/date intentionally not attached (unverified).
    id: "david-sanya",
    name: "David Sanya",
    position: 1,
    location: "Dar es Salaam, Tanzania",
    prize: "TZS 130,000",
    // Slot is registered; the genuine photo has not been received yet.
    imageId: "davidSanyaPortrait",
    imageAlt: "David Sanya, first-place Albastini winner",
  },
];
