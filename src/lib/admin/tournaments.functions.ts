import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireAdmin, failure, type MutationResult } from "./guard";
import { tournamentSchema } from "./schemas";
import { updateTournament, createTournament } from "./cms-core";

export type TournamentRow = {
  id: string;
  tournamentNumber: number;
  title: string;
  startsAt: string | null;
  timezone: string;
  status: string;
  registrationMethod: "app" | "web";
  registrationUrl: string | null;
  playMode: string;
  published: boolean;
};

type Db = {
  tournament_number: number;
  title: string;
  starts_at: string | null;
  timezone: string;
  status: string;
  registration_method: "app" | "web";
  registration_url: string | null;
  play_mode: string;
  published: boolean;
  id: string;
};

function toRow(r: Db): TournamentRow {
  return {
    id: r.id,
    tournamentNumber: r.tournament_number,
    title: r.title,
    startsAt: r.starts_at,
    timezone: r.timezone,
    status: r.status,
    registrationMethod: r.registration_method,
    registrationUrl: r.registration_url,
    playMode: r.play_mode,
    published: r.published,
  };
}

/** All tournaments, including drafts, for the admin. Reads use the admin's own session. */
export const listTournaments = createServerFn({ method: "GET" }).handler(
  async (): Promise<MutationResult<TournamentRow[]>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("tournament_number", { ascending: false });
      if (error) return { ok: false, error: "Could not load tournaments." };
      return { ok: true, data: (data as Db[]).map(toRow) };
    } catch (e) {
      return failure(e, "Could not load tournaments.");
    }
  },
);

/** Update one tournament. Validated on the server; saved only when the database confirms the row. */
export const saveTournament = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; values?: unknown };
    if (raw?.id !== null && (typeof raw?.id !== "string" || !/^[0-9a-f-]{36}$/i.test(raw.id)))
      throw new Error("Invalid tournament id.");
    return { id: raw.id as string | null, values: tournamentSchema.parse(raw.values) };
  })
  .handler(async ({ data }): Promise<MutationResult<TournamentRow>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const result = data.id
        ? await updateTournament(supabase, data.id, data.values)
        : await createTournament(supabase, data.values);
      if (!result.ok) return result;
      return { ok: true, data: toRow(result.data as Db) };
    } catch (e) {
      return failure(e);
    }
  });
