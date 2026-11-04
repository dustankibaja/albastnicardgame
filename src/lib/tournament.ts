import type { Tournament } from "@/content/tournaments";

/** What the site displays. Derived from editorial status + the current time. */
export type TournamentPhase = "upcoming" | "live" | "ended" | "postponed" | "cancelled";

/**
 * Africa/Dar_es_Salaam is UTC+3 all year (no daylight saving), so calendar-day
 * boundaries can be expressed with a fixed +03:00 offset. Formatting for display
 * always goes through Intl with the IANA zone, never the viewer's device zone.
 */
const DAR_OFFSET = "+03:00";

function dayStart(date: string) {
  return Date.parse(`${date}T00:00:00${DAR_OFFSET}`);
}
function dayEnd(date: string) {
  return Date.parse(`${date}T23:59:59.999${DAR_OFFSET}`);
}

export function getTournamentPhase(t: Tournament, now: number): TournamentPhase {
  if (t.status === "cancelled") return "cancelled";
  // Postponed with no new date yet: still the next event, honestly labelled.
  if (t.status === "postponed") return "postponed";
  if (t.status === "completed") return "ended";

  // No verified start time: never claim "live". It stays upcoming through its
  // calendar day, then ends.
  if (!t.startAt) return now <= dayEnd(t.date) ? "upcoming" : "ended";

  const start = Date.parse(t.startAt);
  if (now < start) return "upcoming";

  // Duration is never inferred. Without a verified endAt, "live" is capped at the
  // end of the event's calendar day in Dar es Salaam so it can't stick forever.
  const end = t.endAt ? Date.parse(t.endAt) : dayEnd(t.date);
  return now < end ? "live" : "ended";
}

/** The next tournament worth featuring: the earliest upcoming or live event. */
export function getFeaturedTournament(list: Tournament[], now: number): Tournament | null {
  const sortKey = (t: Tournament) => (t.startAt ? Date.parse(t.startAt) : dayStart(t.date));
  const active = list
    .filter((t) => {
      const phase = getTournamentPhase(t, now);
      return phase === "upcoming" || phase === "live" || phase === "postponed";
    })
    .sort((a, b) => sortKey(a) - sortKey(b));
  return active[0] ?? null;
}

export type Countdown = { days: number; hours: number; minutes: number; seconds: number };

/** Time remaining until `target`, clamped at zero. Never negative. */
export function getCountdown(target: number, now: number): Countdown {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/*
 * Display formatting is done by hand, NOT with Intl.DateTimeFormat: Node (SSR)
 * and browsers ship different ICU data and format the same date differently
 * (e.g. "Saturday, 21 November 2026" vs "Saturday 21 November 2026"), which
 * caused a hydration mismatch. This output is identical on every engine and
 * always in Tanzania time, whatever the viewer's device zone.
 */
const MONTHS = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  sw: [
    "Januari",
    "Februari",
    "Machi",
    "Aprili",
    "Mei",
    "Juni",
    "Julai",
    "Agosti",
    "Septemba",
    "Oktoba",
    "Novemba",
    "Desemba",
  ],
} as const;
const WEEKDAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  sw: ["Jumapili", "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi"],
} as const;

/** Wall-clock parts in Africa/Dar_es_Salaam (fixed UTC+3) for an instant. */
function darParts(ms: number) {
  const d = new Date(ms + 3 * 60 * 60 * 1000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

export function formatTournamentDate(t: Tournament, lang: "en" | "sw") {
  const ms = t.startAt ? Date.parse(t.startAt) : Date.parse(`${t.date}T12:00:00${DAR_OFFSET}`);
  const p = darParts(ms);
  return `${WEEKDAYS[lang][p.weekday]}, ${p.day} ${MONTHS[lang][p.month]} ${p.year}`;
}

export function formatTournamentTime(t: Tournament, lang: "en" | "sw") {
  if (!t.startAt) return null;
  const p = darParts(Date.parse(t.startAt));
  const mm = String(p.minute).padStart(2, "0");
  if (lang === "sw") return `${String(p.hour).padStart(2, "0")}:${mm}`;
  const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return `${h12}:${mm} ${p.hour < 12 ? "AM" : "PM"}`;
}
