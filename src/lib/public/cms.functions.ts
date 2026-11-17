import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";
import {
  composePublicContent,
  composeShop,
  fallbackContent,
  type ChampionRows,
  type Domain,
  type ProductRow,
  type PublicContent,
  type PublicProduct,
  type QueryOutcome,
  type TournamentRow,
  type WinnerRow,
} from "./cms-mapping";

/*
 * Public reads. The publishable (anonymous-class) key only. Row-level security decides what
 * is visible; every query also filters to published content, so an unpublished row is never
 * requested. No service-role credential exists in this path.
 * Each domain is its own query, so one failure falls back for that domain alone.
 */
async function settle<T>(
  run: () => PromiseLike<{ data: T; error: unknown }>,
): Promise<QueryOutcome<T>> {
  try {
    const { data, error } = await run();
    if (error) return { ok: false };
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

export const getPublicContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicContent> => {
    const now = Date.now();
    const supabase = createSupabaseServerClient();
    if (!supabase) return fallbackContent(now); // environment missing: verified fallback everywhere

    const upcoming = await settle(
      async () =>
        (await supabase
          .from("tournaments")
          .select(
            "id, tournament_number, title, starts_at, timezone, status, registration_method, registration_url, published",
          )
          .eq("status", "upcoming")
          .eq("published", true)
          .order("starts_at", { ascending: true, nullsFirst: false })
          .limit(1)) as unknown as { data: TournamentRow[]; error: unknown },
    );

    const champion = await settle<ChampionRows>(async () => {
      const latest = await supabase
        .from("tournaments")
        .select(
          "id, tournament_number, title, starts_at, timezone, status, registration_method, registration_url, published",
        )
        .eq("status", "completed")
        .eq("published", true)
        .order("starts_at", { ascending: false, nullsFirst: false })
        .limit(1);
      if (latest.error) return { data: null, error: latest.error };
      const tournament = (latest.data as TournamentRow[] | null)?.[0];
      if (!tournament) return { data: null, error: null };
      const winners = await supabase
        .from("winners")
        .select(
          "id, tournament_id, display_name, placement, location, prize_amount, photo_mode, published",
        )
        .eq("tournament_id", tournament.id)
        .eq("published", true)
        .order("placement", { ascending: true });
      if (winners.error) return { data: null, error: winners.error };
      return { data: { tournament, winners: (winners.data as WinnerRow[]) ?? [] }, error: null };
    });

    const countdown = await settle(
      async () =>
        (await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "tournament_countdown_enabled")
          .eq("is_public", true)
          .maybeSingle()) as unknown as { data: { value: unknown } | null; error: unknown },
    );

    const tutorial = await settle(
      async () =>
        (await supabase
          .from("how_to_play_videos")
          .select("youtube_id")
          .eq("language", "en")
          .eq("active", true)
          .eq("published", true)
          .limit(1)) as unknown as { data: { youtube_id: string }[]; error: unknown },
    );

    return composePublicContent(now, { upcoming, champion, countdown, tutorial });
  },
);

/** Shop: published products, ordered by the database. Falls back to the verified Physical Cards record. */
export const getPublicShop = createServerFn({ method: "GET" }).handler(
  async (): Promise<Domain<PublicProduct[]>> => {
    const supabase = createSupabaseServerClient();
    if (!supabase) return composeShop({ ok: false });
    const products = await settle(
      async () =>
        (await supabase
          .from("products")
          .select(
            "id, slug, category, name, description, name_sw, description_sw, price_amount, currency, availability, featured, published, sort_order",
          )
          .eq("published", true)
          .order("sort_order", { ascending: true })) as unknown as {
          data: ProductRow[];
          error: unknown;
        },
    );
    return composeShop(products);
  },
);
