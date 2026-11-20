import { test } from "node:test";
import assert from "node:assert/strict";
import {
  updateTournament,
  setCountdownEnabled,
  saveTutorial,
  type QueryClient,
} from "../src/lib/admin/cms-core";
import { toEastAfricaIso, splitEastAfricaIso, previewEastAfrica } from "../src/lib/admin/format";
import { tournamentSchema, tutorialSchema } from "../src/lib/admin/schemas";

/** Fake query client: records each table/update/filter, returns scripted results. */
function fake(script: Record<string, { data?: unknown[] | null; error?: unknown }>) {
  const log: { table: string; values: Record<string, unknown>; filters: [string, unknown][] }[] =
    [];
  const client: QueryClient = {
    from(table) {
      return {
        update(values) {
          const entry = { table, values, filters: [] as [string, unknown][] };
          log.push(entry);
          const chain = {
            eq(column: string, value: unknown) {
              entry.filters.push([column, value]);
              return chain;
            },
            select(_columns: string) {
              const result = script[table] ?? { data: [], error: null };
              return Promise.resolve({ data: result.data ?? null, error: result.error ?? null });
            },
          };
          return chain as unknown as ReturnType<ReturnType<QueryClient["from"]>["update"]>;
        },
      };
    },
  };
  return { client, log };
}

const T27 = tournamentSchema.parse({
  tournamentNumber: 27,
  title: "Tournament #27",
  startsAt: "2026-12-12T20:00:00+03:00",
  timezone: "Africa/Dar_es_Salaam",
  status: "upcoming",
  registrationMethod: "app",
  registrationUrl: null,
  playMode: "on_app",
  published: true,
});
const ID = "00000000-0000-4000-8000-000000000027";

// ---- tournament ----
test("tournament: a saved row is reported as saved, with the database row returned", async () => {
  const { client, log } = fake({ tournaments: { data: [{ id: ID, tournament_number: 27 }] } });
  const r = await updateTournament(client, ID, T27);
  assert.equal(r.ok, true);
  assert.equal(log[0]?.table, "tournaments");
  assert.deepEqual(log[0]?.filters, [["id", ID]]);
  assert.equal(log[0]?.values["starts_at"], "2026-12-12T20:00:00+03:00");
});
test("tournament: an RLS denial (zero rows, no error) is NOT reported as saved", async () => {
  const { client } = fake({ tournaments: { data: [] } });
  const r = await updateTournament(client, ID, T27);
  assert.equal(r.ok, false);
});
test("tournament: a database error is reported as an error, never success", async () => {
  const { client } = fake({ tournaments: { error: { message: "boom" } } });
  assert.equal((await updateTournament(client, ID, T27)).ok, false);
});
test("tournament: an invalid submission never reaches the database", () => {
  assert.equal(tournamentSchema.safeParse({ ...T27, tournamentNumber: -1 }).success, false);
});

// ---- countdown setting ----
test("countdown ON is saved and confirmed", async () => {
  const { client, log } = fake({ site_settings: { data: [{ value: true }] } });
  assert.deepEqual(await setCountdownEnabled(client, true), { ok: true, data: true });
  assert.deepEqual(log[0]?.values, { value: true });
  assert.deepEqual(log[0]?.filters, [["key", "tournament_countdown_enabled"]]);
});
test("countdown OFF is saved and confirmed", async () => {
  const { client } = fake({ site_settings: { data: [{ value: false }] } });
  assert.deepEqual(await setCountdownEnabled(client, false), { ok: true, data: false });
});
test("countdown: a denied or failed write is reported, never fake success", async () => {
  assert.equal(
    (await setCountdownEnabled(fake({ site_settings: { data: [] } }).client, true)).ok,
    false,
  );
  assert.equal(
    (await setCountdownEnabled(fake({ site_settings: { error: {} } }).client, true)).ok,
    false,
  );
});

// ---- tutorials ----
const tutorial = tutorialSchema.parse({
  language: "en",
  title: "How to Play Albastini",
  youtubeUrl: "https://youtu.be/wGd1QJHSU0E?si=FO38XyWBIv1Wbq55",
  published: true,
  active: true,
});
test("tutorial: the YouTube URL is stored as the 11-character ID, never HTML", async () => {
  const { client, log } = fake({ how_to_play_videos: { data: [{ id: "x" }] } });
  assert.equal((await saveTutorial(client, ID, tutorial)).ok, true);
  const save = log.find((l) => "youtube_id" in l.values);
  assert.equal(save?.values["youtube_id"], "wGd1QJHSU0E");
});
test("tutorial: activating deactivates the other records in that language FIRST", async () => {
  const { client, log } = fake({ how_to_play_videos: { data: [{ id: "x" }] } });
  await saveTutorial(client, ID, tutorial);
  assert.deepEqual(log[0]?.values, { active: false });
  assert.deepEqual(log[0]?.filters, [["language", "en"]]);
  assert.equal("youtube_id" in (log[1]?.values ?? {}), true);
});
test("tutorial: invalid URL is rejected by the schema before any write", () => {
  assert.equal(
    tutorialSchema.safeParse({
      language: "en",
      title: "x",
      youtubeUrl: "<iframe src=x>",
      published: true,
      active: true,
    }).success,
    false,
  );
});
test("tutorial: a denied save (zero rows) is reported as an error", async () => {
  const { client } = fake({ how_to_play_videos: { data: [] } });
  assert.equal((await saveTutorial(client, ID, tutorial)).ok, false);
});

// ---- Dar es Salaam date and time for the owner ----
test("date and time combine into a +03:00 instant (no ISO typing for the owner)", () => {
  assert.equal(toEastAfricaIso("2026-12-12", "20:00"), "2026-12-12T20:00:00+03:00");
  assert.equal(toEastAfricaIso("12/12/2026", "20:00"), null);
});
test("an instant splits back into the Dar es Salaam date and 24h time", () => {
  assert.deepEqual(splitEastAfricaIso("2026-12-12T20:00:00+03:00"), {
    date: "2026-12-12",
    time: "20:00",
  });
});
test("preview reads exactly '12 December 2026' and '8:00 PM EAT' for Tournament #27", () => {
  assert.deepEqual(previewEastAfrica("2026-12-12T20:00:00+03:00"), {
    date: "12 December 2026",
    time: "8:00 PM EAT",
  });
});
