/*
 * Public CMS mapping and fallback. Framework-free and pure, so every case of the fallback
 * matrix is tested directly. Each domain decides on its own: a failure in one domain does
 * not replace the others. Unpublished rows never reach this layer (RLS and the query filter
 * both exclude them); the mappers refuse them again as a second guard.
 */
import {
  tournaments as staticTournaments,
  type Tournament,
  type TournamentStatus,
} from "@/content/tournaments";
import { winners as staticWinners, type Winner } from "@/content/winners";
import { getFeaturedTournament } from "@/lib/tournament";
import { splitEastAfricaIso } from "@/lib/admin/format";

export type Source = "cms" | "fallback";
export type Domain<T> = { source: Source; data: T };
/** Outcome of one query: a usable answer, or an error / missing configuration. */
export type QueryOutcome<T> = { ok: true; data: T } | { ok: false };

/** Use CMS data only when it is usable; otherwise the verified fallback, for that domain alone. */
export function resolveDomain<T>(
  outcome: QueryOutcome<T | null | readonly unknown[]>,
  fallback: T,
): Domain<T> {
  if (!outcome.ok) return { source: "fallback", data: fallback };
  const value = outcome.data;
  if (value === null || value === undefined) return { source: "fallback", data: fallback };
  if (Array.isArray(value) && value.length === 0) return { source: "fallback", data: fallback };
  return { source: "cms", data: value as T };
}

const STATUSES: readonly TournamentStatus[] = [
  "upcoming",
  "live",
  "completed",
  "postponed",
  "cancelled",
];
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export type TournamentRow = {
  id: string;
  tournament_number: number;
  title: string;
  starts_at: string | null;
  timezone: string;
  status: string;
  registration_method: "app" | "web";
  registration_url: string | null;
  published: boolean;
};
export type WinnerRow = {
  id: string;
  tournament_id: string;
  display_name: string;
  placement: number;
  location: string;
  prize_amount: number;
  photo_mode: "portrait-cutout" | "editorial-photo";
  published: boolean;
};
export type ProductRow = {
  id: string;
  slug: string;
  category: string;
  name: string;
  description: string | null;
  name_sw: string | null;
  description_sw: string | null;
  price_amount: number | null;
  currency: string | null;
  availability: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

/** A published tournament row becomes the Tournament shape the Arena renders. Null if unusable. */
export function mapTournament(row: TournamentRow): Tournament | null {
  if (!row.published || !(STATUSES as readonly string[]).includes(row.status)) return null;
  if (row.timezone !== "Africa/Dar_es_Salaam") return null;
  const date = row.starts_at ? splitEastAfricaIso(row.starts_at).date : null;
  if (!date) return null;
  const base: Tournament = {
    id: row.id,
    number: row.tournament_number,
    status: row.status as TournamentStatus,
    date,
    timezone: "Africa/Dar_es_Salaam",
    title: row.title,
  };
  if (row.starts_at) base.startAt = row.starts_at;
  if (row.registration_method === "app") base.registration = "app";
  if (row.registration_method === "web" && row.registration_url)
    base.registrationUrl = row.registration_url;
  return base;
}

/**
 * A published winner row becomes the Winner shape. Photo references are repository assets, so
 * the seeded winners keep theirs by display name. A winner with no matching repository asset
 * shows the frame's typographic state rather than a fake image.
 */
export function mapWinner(row: WinnerRow, tournamentId: string): Winner | null {
  if (!row.published) return null;
  if (![1, 2, 3].includes(row.placement)) return null;
  if (!row.display_name || !row.location) return null;
  if (row.photo_mode !== "portrait-cutout" && row.photo_mode !== "editorial-photo") return null;
  const seeded = staticWinners.find((w) => w.displayName === row.display_name);
  const winner: Winner = {
    id: row.id,
    displayName: row.display_name,
    placement: row.placement as Winner["placement"],
    location: row.location,
    tournamentId,
    photoMode: row.photo_mode,
    prizeAmount: row.prize_amount,
  };
  if (seeded?.portrait) winner.portrait = seeded.portrait;
  if (seeded?.portraitAltKey) winner.portraitAltKey = seeded.portraitAltKey;
  if (seeded?.imageFit) winner.imageFit = seeded.imageFit;
  if (seeded?.imagePosition) winner.imagePosition = seeded.imagePosition;
  return winner;
}

/** A tutorial ID is accepted only in its canonical 11-character form (never iframe HTML). */
export function tutorialIdOrNull(value: string | null | undefined): string | null {
  return value && YOUTUBE_ID.test(value) ? value : null;
}

// ---- the verified fallback: current source-controlled truth ----
export const FALLBACK_TUTORIAL_ID = "wGd1QJHSU0E";
export const FALLBACK_COUNTDOWN = false;

export type PublicContent = {
  /** Tournaments the Competition section needs: the upcoming one and the latest with winners. */
  tournaments: Domain<Tournament[]>;
  winners: Domain<Winner[]>;
  countdown: Domain<boolean>;
  tutorialId: Domain<string>;
};

/** Verified fallback for every public domain. Equal to the source-controlled content. */
export function fallbackContent(now: number): PublicContent {
  const upcoming = getFeaturedTournament(staticTournaments, now);
  const championTournament =
    [...staticTournaments]
      .reverse()
      .find((t) => staticWinners.some((w) => w.tournamentId === t.id)) ?? null;
  const list = [upcoming, championTournament].filter(
    (t, i, all): t is Tournament => !!t && all.indexOf(t) === i,
  );
  return {
    tournaments: { source: "fallback", data: list.length ? list : staticTournaments },
    winners: { source: "fallback", data: staticWinners },
    countdown: { source: "fallback", data: FALLBACK_COUNTDOWN },
    tutorialId: { source: "fallback", data: FALLBACK_TUTORIAL_ID },
  };
}

export type ChampionRows = { tournament: TournamentRow; winners: WinnerRow[] } | null;

/**
 * Compose public content from the individual query outcomes. Domains are independent, with
 * one exception: the Champions tournament and its winners are one domain, because the winners'
 * tournament id must match the tournament shown with them.
 */
export function composePublicContent(
  now: number,
  q: {
    upcoming: QueryOutcome<TournamentRow[]>;
    champion: QueryOutcome<ChampionRows>;
    countdown: QueryOutcome<{ value: unknown } | null>;
    tutorial: QueryOutcome<{ youtube_id: string }[]>;
  },
): PublicContent {
  const fallback = fallbackContent(now);

  // Upcoming tournament: the first usable published row.
  const upcomingRow = q.upcoming.ok ? (q.upcoming.data[0] ?? null) : null;
  const upcomingMapped = upcomingRow ? mapTournament(upcomingRow) : null;
  const upcomingDomain = resolveDomain<Tournament | null>(
    { ok: true, data: upcomingMapped },
    fallback.tournaments.data.find((t) => t.status === "upcoming") ?? null,
  );
  const upcomingSource: Source = q.upcoming.ok && upcomingMapped ? "cms" : "fallback";

  // Champions: the latest completed tournament and its published winners, as one domain.
  let championTournament: Tournament | null = null;
  let championWinners: Winner[] = [];
  let championSource: Source = "fallback";
  if (q.champion.ok && q.champion.data) {
    const mapped = mapTournament(q.champion.data.tournament);
    const winners = q.champion.data.winners
      .map((w) => (mapped ? mapWinner(w, mapped.id) : null))
      .filter((w): w is Winner => w !== null)
      .sort((a, b) => a.placement - b.placement);
    if (mapped && winners.length > 0) {
      championTournament = mapped;
      championWinners = winners;
      championSource = "cms";
    }
  }
  if (championSource === "fallback") {
    championWinners = fallback.winners.data;
    championTournament = fallback.tournaments.data.find((t) => t.status === "completed") ?? null;
  }

  const countdownValue = q.countdown.ok ? q.countdown.data?.value : undefined;
  const countdown = resolveDomain<boolean>(
    { ok: true, data: typeof countdownValue === "boolean" ? countdownValue : null },
    FALLBACK_COUNTDOWN,
  );

  const tutorialRow = q.tutorial.ok ? (q.tutorial.data[0] ?? null) : null;
  const tutorialId = resolveDomain<string>(
    { ok: true, data: tutorialIdOrNull(tutorialRow?.youtube_id) },
    FALLBACK_TUTORIAL_ID,
  );

  const list = [upcomingDomain.data, championTournament].filter(
    (t, i, all): t is Tournament => !!t && all.indexOf(t) === i,
  );

  return {
    tournaments: {
      source: upcomingSource === "cms" || championSource === "cms" ? "cms" : "fallback",
      data: list.length ? list : staticTournaments,
    },
    winners: { source: championSource, data: championWinners },
    countdown,
    tutorialId,
  };
}

// ---- Shop: published products only ----
export type PublicProduct = {
  slug: string;
  name: string;
  description: string | null;
  nameSw: string | null;
  descriptionSw: string | null;
  /** Null unless a real amount AND a supported currency exist. Never a made-up price. */
  price: { amount: number; currency: "TZS" } | null;
  availability: "available" | "unavailable" | "coming_soon";
  featured: boolean;
  sortOrder: number;
};

const AVAILABILITY_VALUES = ["available", "unavailable", "coming_soon"] as const;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The verified Physical Cards record: no price, no invented stock. */
export const FALLBACK_PRODUCTS: PublicProduct[] = [
  {
    slug: "physical-cards",
    name: "Physical Cards",
    description: null,
    nameSw: null,
    descriptionSw: null,
    price: null,
    availability: "coming_soon",
    featured: true,
    sortOrder: 1,
  },
];

export function mapProduct(row: ProductRow): PublicProduct | null {
  if (!row.published) return null;
  if (!SLUG_PATTERN.test(row.slug) || !row.name.trim()) return null;
  if (!(AVAILABILITY_VALUES as readonly string[]).includes(row.availability)) return null;
  // A price shows only when both the amount and a supported currency are present.
  const price =
    row.price_amount !== null && row.price_amount >= 0 && row.currency === "TZS"
      ? { amount: row.price_amount, currency: "TZS" as const }
      : null;
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    nameSw: row.name_sw,
    descriptionSw: row.description_sw,
    price,
    availability: row.availability as PublicProduct["availability"],
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}

/** Deterministic order: sort_order, then name, then slug, so the page never reorders between renders. */
export function orderProducts(list: PublicProduct[]): PublicProduct[] {
  return [...list].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug),
  );
}

export function composeShop(outcome: QueryOutcome<ProductRow[]>): Domain<PublicProduct[]> {
  if (!outcome.ok) return { source: "fallback", data: FALLBACK_PRODUCTS };
  const mapped = orderProducts(
    outcome.data.map(mapProduct).filter((p): p is PublicProduct => p !== null),
  );
  return resolveDomain<PublicProduct[]>({ ok: true, data: mapped }, FALLBACK_PRODUCTS);
}

/**
 * The homepage teaser shows the featured product. With none featured, the verified Physical
 * Cards record is used, so the teaser is always deterministic.
 */
export function teaserProduct(shop: Domain<PublicProduct[]>): PublicProduct {
  return shop.data.find((p) => p.featured) ?? FALLBACK_PRODUCTS[0]!;
}

/** Swahili copy when valid Swahili content exists, otherwise English. Null when neither is usable. */
export function localizedProductDescription(
  product: Pick<PublicProduct, "description" | "descriptionSw">,
  lang: string,
): string | null {
  const candidate =
    lang === "sw" && product.descriptionSw?.trim() ? product.descriptionSw : product.description;
  return candidate && candidate.trim() ? candidate.trim() : null;
}
