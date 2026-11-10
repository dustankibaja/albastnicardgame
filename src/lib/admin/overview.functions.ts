import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { createSupabaseServerClient } from "../supabase/server";
import { resolveAdminStatus, AdminDataError } from "./auth-core";
import { asClientLike } from "./server-adapter";

export type OverviewStats = {
  upcoming: { number: number; startsAt: string | null; timezone: string } | null;
  publishedWinners: number;
  publishedProducts: number;
  tutorial: { title: string; language: string } | null;
  countdownEnabled: boolean;
};

/**
 * Overview facts, read with the signed-in administrator's own session (RLS applies).
 * Admin status is re-verified here: a page cannot be used to read this data unless the
 * server confirms the caller is an administrator.
 */
export const getOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<OverviewStats> => {
    setResponseHeader("Cache-Control", "private, no-store");
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new AdminDataError("Supabase is not configured.");
    const status = await resolveAdminStatus(asClientLike(supabase));
    if (status.kind !== "admin") throw new AdminDataError("Not an administrator.");

    const [t27, winners, products, tutorial, countdown] = await Promise.all([
      supabase
        .from("tournaments")
        .select("tournament_number, starts_at, timezone")
        .eq("tournament_number", 27)
        .maybeSingle(),
      supabase.from("winners").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("published", true),
      supabase
        .from("how_to_play_videos")
        .select("title, language")
        .eq("active", true)
        .eq("language", "en")
        .maybeSingle(),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "tournament_countdown_enabled")
        .maybeSingle(),
    ]);
    for (const r of [t27, winners, products, tutorial, countdown]) {
      if (r.error) throw new AdminDataError("Could not read overview data.");
    }
    const t = t27.data as {
      tournament_number: number;
      starts_at: string | null;
      timezone: string;
    } | null;
    return {
      upcoming: t
        ? { number: t.tournament_number, startsAt: t.starts_at, timezone: t.timezone }
        : null,
      publishedWinners: winners.count ?? 0,
      publishedProducts: products.count ?? 0,
      tutorial: (tutorial.data as { title: string; language: string } | null) ?? null,
      countdownEnabled: (countdown.data as { value: unknown } | null)?.value === true,
    };
  },
);
