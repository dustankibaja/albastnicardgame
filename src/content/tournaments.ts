/**
 * TOURNAMENTS — single source of truth. Only verified facts.
 * Leave a field out rather than guessing it; the UI degrades gracefully.
 *
 * Postponement: when an event moves, keep the SAME record (same number),
 * update `date`, and keep the old date in `previousScheduledDate` (internal).
 * Use status "postponed" only while no new date is known.
 */

export const TOURNAMENT_TIMEZONE = "Africa/Dar_es_Salaam" as const;

export type TournamentMode = "app" | "in_person" | "hybrid";
export type TournamentStatus = "upcoming" | "live" | "completed" | "postponed" | "cancelled";

export type Tournament = {
  id: string;
  number: number;
  status: TournamentStatus;
  /** Calendar date in Africa/Dar_es_Salaam, YYYY-MM-DD. */
  date: string;
  /** Verified start instant (ISO 8601 with offset). No countdown without it. */
  startAt?: string;
  /** Verified end instant. Never inferred. */
  endAt?: string;
  timezone: typeof TOURNAMENT_TIMEZONE;
  mode?: TournamentMode;
  /** Where players register. "app" = inside the Albastini app (no web URL). */
  registration?: "app";
  /** Verified web registration destination, if one ever exists. */
  registrationUrl?: string;
  /** Internal history only (e.g. a postponed date). Not shown publicly. */
  previousScheduledDate?: string;
  title?: string;
  location?: string;
};

export const tournaments: Tournament[] = [
  {
    // Verified by the official Tournament #26 winner posters.
    id: "tournament-26",
    number: 26,
    status: "completed",
    date: "2026-09-26",
    timezone: TOURNAMENT_TIMEZONE,
  },
  {
    // Verified (owner-confirmed): Saturday 12 Dec 2026, 8:00 PM EAT (UTC+3).
    id: "tournament-27",
    number: 27,
    status: "upcoming",
    date: "2026-12-12",
    startAt: "2026-12-12T20:00:00+03:00",
    timezone: TOURNAMENT_TIMEZONE,
    registration: "app",
    previousScheduledDate: "2026-10-31",
  },
];
