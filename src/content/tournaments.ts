/**
 * TOURNAMENTS — single source of truth.
 *
 * Only add what the Albastini team has verified. Leave a field out rather than
 * guessing it: every optional field degrades to a neutral "coming soon" state.
 *
 * Deviations from the Phase 1 brief's minimum type, on purpose:
 * - `number`, `mode` and `startAt` are optional because the 21 Nov 2026 event
 *   has a verified date but no verified number, mode or start time yet.
 * - `date` (YYYY-MM-DD in Dar es Salaam) is always present, so an event with an
 *   unconfirmed start time can still be listed without inventing one.
 */

export const TOURNAMENT_TIMEZONE = "Africa/Dar_es_Salaam" as const;

export type TournamentMode = "app" | "in_person" | "hybrid";

/** Editorial status set by the team. The displayed phase is derived from time too. */
export type TournamentStatus = "upcoming" | "live" | "completed" | "cancelled";

export type Tournament = {
  id: string;
  number?: number;
  title?: string;
  mode?: TournamentMode;
  /** Calendar date in Africa/Dar_es_Salaam, YYYY-MM-DD. */
  date: string;
  /** Verified start instant, ISO 8601 with offset (e.g. 2026-10-31T20:00:00+03:00). */
  startAt?: string;
  /** Verified end instant. Never inferred. */
  endAt?: string;
  timezone: typeof TOURNAMENT_TIMEZONE;
  status: TournamentStatus;
  location?: string;
  /** Verified registration destination. Until set, the CTA opens the app download. */
  registrationUrl?: string;
};

export const tournaments: Tournament[] = [
  {
    // Verified: 31 Oct 2026, 8:00 PM, app-only. Event has passed; no verified results yet.
    id: "tournament-27",
    number: 27,
    mode: "app",
    date: "2026-10-31",
    startAt: "2026-10-31T20:00:00+03:00",
    timezone: TOURNAMENT_TIMEZONE,
    status: "completed",
  },
  {
    // Verified: date only. Number, mode and start time are NOT verified yet.
    id: "tournament-2026-11-21",
    date: "2026-11-21",
    timezone: TOURNAMENT_TIMEZONE,
    status: "upcoming",
  },
];
