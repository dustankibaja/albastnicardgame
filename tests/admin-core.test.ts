import { test } from "node:test";
import assert from "node:assert/strict";
import { readSupabaseConfig } from "../src/lib/supabase/config";
import {
  youtubeIdFromInput,
  tournamentSchema,
  winnerSchema,
  productSchema,
  tutorialSchema,
  loginSchema,
} from "../src/lib/admin/schemas";
import {
  resolveAdminStatus,
  signInAsAdmin,
  AdminDataError,
  type ClientLike,
} from "../src/lib/admin/auth-core";

// ---------- configuration ----------
test("missing public config yields an explicit unconfigured state (null), never guesses", () => {
  assert.equal(readSupabaseConfig({}), null);
  assert.equal(readSupabaseConfig({ VITE_SUPABASE_URL: "https://x.supabase.co" }), null);
});
test("a non-Supabase URL is refused", () => {
  assert.equal(
    readSupabaseConfig({
      VITE_SUPABASE_URL: "https://evil.example.com",
      VITE_SUPABASE_PUBLISHABLE_KEY: "k",
    }),
    null,
  );
});
test("a Supabase project URL and publishable key are accepted", () => {
  const c = readSupabaseConfig({
    VITE_SUPABASE_URL: "https://abcdefgh.supabase.co/",
    VITE_SUPABASE_PUBLISHABLE_KEY: "pk",
  });
  assert.deepEqual(c, { url: "https://abcdefgh.supabase.co", publishableKey: "pk" });
});

// ---------- YouTube input ----------
test("YouTube input: the owner's tutorial link yields its 11-character ID", () => {
  assert.equal(
    youtubeIdFromInput("https://youtu.be/wGd1QJHSU0E?si=FO38XyWBIv1Wbq55"),
    "wGd1QJHSU0E",
  );
});
test("YouTube input: watch, embed and bare-ID forms are accepted", () => {
  assert.equal(youtubeIdFromInput("https://www.youtube.com/watch?v=wGd1QJHSU0E"), "wGd1QJHSU0E");
  assert.equal(youtubeIdFromInput("https://www.youtube.com/embed/wGd1QJHSU0E"), "wGd1QJHSU0E");
  assert.equal(youtubeIdFromInput("wGd1QJHSU0E"), "wGd1QJHSU0E");
});
test("YouTube input: raw HTML, http, other hosts and short IDs are refused", () => {
  assert.equal(
    youtubeIdFromInput('<iframe src="https://www.youtube.com/embed/wGd1QJHSU0E"></iframe>'),
    null,
  );
  assert.equal(youtubeIdFromInput("http://youtu.be/wGd1QJHSU0E"), null);
  assert.equal(youtubeIdFromInput("https://evil.example.com/wGd1QJHSU0E"), null);
  assert.equal(youtubeIdFromInput("short"), null);
});

// ---------- schemas (the server-side boundary) ----------
const goodTournament = {
  tournamentNumber: 27,
  title: "Tournament #27",
  startsAt: "2026-12-12T20:00:00+03:00",
  timezone: "Africa/Dar_es_Salaam" as const,
  status: "upcoming" as const,
  registrationMethod: "app" as const,
  registrationUrl: null,
  playMode: "on_app" as const,
  published: true,
};
test("tournament: the verified Tournament #27 record is valid", () => {
  assert.equal(tournamentSchema.safeParse(goodTournament).success, true);
});
test("tournament: number must be positive; timezone is fixed; web registration needs a link", () => {
  assert.equal(
    tournamentSchema.safeParse({ ...goodTournament, tournamentNumber: 0 }).success,
    false,
  );
  assert.equal(
    tournamentSchema.safeParse({ ...goodTournament, timezone: "Europe/London" }).success,
    false,
  );
  assert.equal(
    tournamentSchema.safeParse({
      ...goodTournament,
      registrationMethod: "web",
      registrationUrl: null,
    }).success,
    false,
  );
  assert.equal(
    tournamentSchema.safeParse({
      ...goodTournament,
      registrationUrl: "https://example.com/register",
    }).success,
    false,
  );
});
test("winner: rank 1-3 only; prize non-negative; supported currency only; valid photo mode", () => {
  const w = {
    displayName: "Bedadi",
    placement: 2,
    location: "Kilimanjaro, Tanzania",
    prizeAmount: 65000,
    currency: "TZS",
    photoMode: "editorial-photo",
    imagePath: null,
    sortOrder: 2,
    published: true,
  };
  assert.equal(winnerSchema.safeParse(w).success, true);
  assert.equal(winnerSchema.safeParse({ ...w, placement: 4 }).success, false);
  assert.equal(winnerSchema.safeParse({ ...w, prizeAmount: -1 }).success, false);
  assert.equal(winnerSchema.safeParse({ ...w, currency: "USD" }).success, false);
  assert.equal(winnerSchema.safeParse({ ...w, photoMode: "cutout" }).success, false);
});
test("product: slug is lowercase-hyphen; a price needs a currency; price may be absent", () => {
  const p = {
    slug: "physical-cards",
    category: "cards",
    name: "Physical Cards",
    description: null,
    nameSw: null,
    descriptionSw: null,
    imagePath: null,
    priceAmount: null,
    currency: null,
    availability: "coming_soon" as const,
    featured: true,
    sortOrder: 1,
    published: true,
  };
  assert.equal(productSchema.safeParse(p).success, true);
  assert.equal(productSchema.safeParse({ ...p, slug: "Physical Cards" }).success, false);
  assert.equal(productSchema.safeParse({ ...p, priceAmount: 5000 }).success, false);
  assert.equal(productSchema.safeParse({ ...p, priceAmount: 5000, currency: "TZS" }).success, true);
});
test("tutorial: stores only the 11-character ID; rejects HTML; language limited to en/sw", () => {
  const ok = tutorialSchema.safeParse({
    language: "en",
    title: "How to Play Albastini",
    youtubeUrl: "https://youtu.be/wGd1QJHSU0E",
    published: true,
    active: true,
  });
  assert.equal(ok.success && ok.data.youtubeUrl, "wGd1QJHSU0E");
  assert.equal(
    tutorialSchema.safeParse({
      language: "en",
      title: "x",
      youtubeUrl: "<iframe>",
      published: true,
      active: true,
    }).success,
    false,
  );
  assert.equal(
    tutorialSchema.safeParse({
      language: "fr",
      title: "x",
      youtubeUrl: "wGd1QJHSU0E",
      published: true,
      active: true,
    }).success,
    false,
  );
});
test("login: email must be valid; password required", () => {
  assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success, false);
  assert.equal(loginSchema.safeParse({ email: "owner@example.com", password: "" }).success, false);
});

// ---------- authorization decisions, with a fake Supabase boundary ----------
type Row = { display_name: string } | null;
function fakeClient(opts: {
  user?: { id: string; email?: string } | null;
  getUserError?: boolean;
  adminRow?: Row;
  adminQueryError?: boolean;
  signInError?: { status?: number } | null;
}) {
  const calls: string[] = [];
  const client: ClientLike = {
    auth: {
      getUser: async () => {
        calls.push("getUser");
        return {
          data: { user: opts.user ?? null },
          error: opts.getUserError ? { message: "x" } : null,
        };
      },
      signInWithPassword: async () => {
        calls.push("signInWithPassword");
        return { error: opts.signInError ?? null };
      },
      signOut: async () => {
        calls.push("signOut");
        return { error: null };
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            calls.push("admin_users");
            return opts.adminQueryError
              ? { data: null, error: { message: "db down" } }
              : { data: opts.adminRow ?? null, error: null };
          },
        }),
      }),
    }),
  };
  return { client, calls };
}

test("no session -> anonymous (redirect to login upstream)", async () => {
  const { client } = fakeClient({ user: null });
  assert.deepEqual(await resolveAdminStatus(client), { kind: "anonymous" });
});
test("signed-in but NOT in admin_users -> forbidden, never admin", async () => {
  const { client } = fakeClient({ user: { id: "u1", email: "a@b.co" }, adminRow: null });
  assert.equal((await resolveAdminStatus(client)).kind, "forbidden");
});
test("signed-in with an admin_users row -> admin", async () => {
  const { client } = fakeClient({ user: { id: "u1" }, adminRow: { display_name: "Owner" } });
  const s = await resolveAdminStatus(client);
  assert.equal(s.kind, "admin");
});
test("a failing admin lookup is an ERROR, not 'not an admin' and not success", async () => {
  const { client } = fakeClient({ user: { id: "u1" }, adminQueryError: true });
  await assert.rejects(resolveAdminStatus(client), AdminDataError);
});
test("bad credentials (4xx) -> invalid-credentials, no session created", async () => {
  const { client, calls } = fakeClient({ signInError: { status: 400 } });
  assert.deepEqual(await signInAsAdmin(client, "a@b.co", "wrong"), {
    ok: false,
    reason: "invalid-credentials",
  });
  assert.equal(calls.includes("signOut"), false);
});
test("auth service outage (5xx) -> unavailable, never fake success", async () => {
  const { client } = fakeClient({ signInError: { status: 503 } });
  assert.deepEqual(await signInAsAdmin(client, "a@b.co", "x"), {
    ok: false,
    reason: "unavailable",
  });
});
test("signed-in non-admin is signed straight back out (no lingering session)", async () => {
  const { client, calls } = fakeClient({ user: { id: "u9" }, adminRow: null });
  assert.deepEqual(await signInAsAdmin(client, "a@b.co", "pw"), {
    ok: false,
    reason: "not-authorized",
  });
  assert.ok(calls.includes("signOut"));
});
test("valid administrator credentials -> ok", async () => {
  const { client } = fakeClient({ user: { id: "u1" }, adminRow: { display_name: "Owner" } });
  assert.deepEqual(await signInAsAdmin(client, "a@b.co", "pw"), { ok: true });
});
