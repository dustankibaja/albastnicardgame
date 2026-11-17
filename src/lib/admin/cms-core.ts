/*
 * CMS mutation cores. Framework-free: each takes a Supabase client (the caller's own
 * request-bound session) and returns an explicit result. Tested with a fake client.
 * RLS is the final enforcement; these checks make denials and empty writes visible.
 */
import { youtubeIdFromInput, type TournamentInput, type TutorialInput } from "./schemas";

export type CmsResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Minimal structural view of the Supabase query surface the cores use. */
export type QueryClient = {
  from(table: string): {
    update(values: Record<string, unknown>): {
      eq(
        column: string,
        value: unknown,
      ): {
        select(columns: string): PromiseLike<{ data: unknown[] | null; error: unknown }>;
      };
    };
  };
};

export type TournamentRecord = {
  id: string;
  tournament_number: number;
  title: string;
  starts_at: string | null;
  timezone: string;
  status: string;
  registration_method: "app" | "web";
  registration_url: string | null;
  play_mode: string;
  published: boolean;
};

/** Update one tournament. Saved only when exactly one row comes back from the database. */
export async function updateTournament(
  supabase: QueryClient,
  id: string,
  v: TournamentInput,
): Promise<CmsResult<TournamentRecord>> {
  const { data, error } = await supabase
    .from("tournaments")
    .update({
      tournament_number: v.tournamentNumber,
      title: v.title,
      starts_at: v.startsAt,
      timezone: v.timezone,
      status: v.status,
      registration_method: v.registrationMethod,
      registration_url: v.registrationUrl,
      play_mode: v.playMode,
      published: v.published,
    })
    .eq("id", id)
    .select("*");
  if (error)
    return {
      ok: false,
      error: "The tournament could not be saved. Check the values and try again.",
    };
  if (!data || data.length !== 1)
    return { ok: false, error: "The tournament was not saved. It may no longer exist." };
  return { ok: true, data: data[0] as TournamentRecord };
}

/** Countdown on/off. Saved only when the database confirms the setting row. */
export async function setCountdownEnabled(
  supabase: QueryClient,
  enabled: boolean,
): Promise<CmsResult<boolean>> {
  const { data, error } = await supabase
    .from("site_settings")
    .update({ value: enabled })
    .eq("key", "tournament_countdown_enabled")
    .select("value");
  if (error) return { ok: false, error: "The setting could not be saved. Try again." };
  if (!data || data.length !== 1) return { ok: false, error: "The setting was not saved." };
  return { ok: true, data: enabled };
}

/**
 * Save a How to Play record. The YouTube value is parsed (never raw HTML) and stored as the
 * 11-character ID. Activating a record first deactivates the others in its language, so
 * at most one active record per language exists.
 */
export async function saveTutorial(
  supabase: QueryClient,
  id: string,
  v: TutorialInput,
): Promise<CmsResult<true>> {
  const youtubeId = youtubeIdFromInput(v.youtubeUrl) ?? v.youtubeUrl;
  if (v.active) {
    const { error: deactivateError } = await supabase
      .from("how_to_play_videos")
      .update({ active: false })
      .eq("language", v.language)
      .select("id");
    if (deactivateError)
      return { ok: false, error: "The tutorial could not be activated. Try again." };
  }
  const { data, error } = await supabase
    .from("how_to_play_videos")
    .update({
      title: v.title,
      language: v.language,
      youtube_id: youtubeId,
      published: v.published,
      active: v.active,
    })
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, error: "The tutorial could not be saved. Try again." };
  if (!data || data.length !== 1)
    return { ok: false, error: "The tutorial was not saved. It may no longer exist." };
  return { ok: true, data: true };
}

/** Create the first tournament without database-console intervention. RLS still enforces admin access. */
export async function createTournament(
  supabase: {
    from(table: string): {
      insert(values: Record<string, unknown>): {
        select(
          columns: string,
        ): PromiseLike<{ data: unknown[] | null; error: { code?: string } | null }>;
      };
    };
  },
  v: TournamentInput,
): Promise<CmsResult<TournamentRecord>> {
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      tournament_number: v.tournamentNumber,
      title: v.title,
      starts_at: v.startsAt,
      timezone: v.timezone,
      status: v.status,
      registration_method: v.registrationMethod,
      registration_url: v.registrationUrl,
      play_mode: v.playMode,
      published: v.published,
    })
    .select("*");
  if (error?.code === "23505")
    return { ok: false, error: "A tournament with this number already exists." };
  if (error || data?.length !== 1)
    return { ok: false, error: "The tournament was not created. Check your access and try again." };
  return { ok: true, data: data[0] as TournamentRecord };
}
