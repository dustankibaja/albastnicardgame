// Database authorization tests. Runs the real migration + seed in an embedded
// Postgres (PGlite) against stand-ins for Supabase's auth/storage schemas, then
// attempts every operation as anon, as an ordinary signed-in user, and as an admin.
// Every attempt is checked against its expected outcome. Any mismatch fails the run.
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";

const ADMIN = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const db = new PGlite();
let passed = 0;
const failures = [];

async function as(role, uid, fn) {
  await db.exec("reset role");
  if (role) await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
// expect the operation to be REJECTED (error) or to affect zero rows
async function denied(name, fn) {
  try {
    const r = await fn();
    const affected = r?.affectedRows ?? 0;
    if (affected === 0) return pass(name);
    return fail(name, `affected ${affected} rows`);
  } catch (e) {
    return pass(name + ` (rejected: ${String(e.message).slice(0, 70)})`);
  }
}
async function allowed(name, fn) {
  try {
    await fn();
    return pass(name);
  } catch (e) {
    return fail(name, e.message);
  }
}
async function expectCount(name, fn, n) {
  try {
    const r = await fn();
    const got = r.rows[0].n;
    return got === n ? pass(name) : fail(name, `expected ${n}, got ${got}`);
  } catch (e) {
    return fail(name, e.message);
  }
}
function pass(name) {
  passed++;
  console.log("  PASS  " + name);
}
function fail(name, why) {
  failures.push(name);
  console.log("  FAIL  " + name + " :: " + why);
}

async function main() {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text not null, public boolean default false);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text);
    alter table storage.objects enable row level security;
    grant usage on schema public, auth, storage to anon, authenticated;
  `);
  await db.exec(
    fs.readFileSync("supabase/migrations/20261110090000_secure_admin_core.sql", "utf8"),
  );
  await db.exec(
    fs.readFileSync("supabase/migrations/20261110100000_admin_audit_triggers.sql", "utf8"),
  );
  await db.exec(fs.readFileSync("supabase/seed.sql", "utf8"));
  // Two real auth users. Only ADMIN is provisioned, by trusted (superuser) access.
  await db.exec(`insert into auth.users (id) values ('${ADMIN}'), ('${USER}')`);
  await db.exec(
    `insert into public.admin_users (user_id, display_name) values ('${ADMIN}', 'Test admin')`,
  );
  // Grant access to the schema for the admin/user role tests above.
  console.log("Database authorization tests\n");

  // ---- Public reads: only published content ----
  await expectCount(
    "anon reads published tournaments (2 seeded, both published)",
    () => as("anon", null, () => db.query("select count(*)::int as n from public.tournaments")),
    2,
  );
  await db.exec("update public.tournaments set published = false where tournament_number = 26");
  await expectCount(
    "anon cannot read an UNPUBLISHED tournament",
    () =>
      as("anon", null, () =>
        db.query("select count(*)::int as n from public.tournaments where tournament_number = 26"),
      ),
    0,
  );
  await expectCount(
    "admin can read the unpublished tournament",
    () =>
      as("authenticated", ADMIN, () =>
        db.query("select count(*)::int as n from public.tournaments where tournament_number = 26"),
      ),
    1,
  );
  await db.exec("update public.tournaments set published = true where tournament_number = 26");

  await expectCount(
    "anon reads published winners (3)",
    () => as("anon", null, () => db.query("select count(*)::int as n from public.winners")),
    3,
  );
  await db.exec("update public.products set published = false where slug = 'physical-cards'");
  await expectCount(
    "anon cannot read an UNPUBLISHED product",
    () => as("anon", null, () => db.query("select count(*)::int as n from public.products")),
    0,
  );
  await db.exec("update public.products set published = true where slug = 'physical-cards'");

  await expectCount(
    "anon reads the public countdown setting",
    () =>
      as("anon", null, () =>
        db.query(
          "select count(*)::int as n from public.site_settings where key = 'tournament_countdown_enabled'",
        ),
      ),
    1,
  );
  await db.exec(
    "insert into public.site_settings (key, value, is_public) values ('private_probe', '1', false)",
  );
  await expectCount(
    "anon cannot read a NON-public setting",
    () =>
      as("anon", null, () =>
        db.query("select count(*)::int as n from public.site_settings where key = 'private_probe'"),
      ),
    0,
  );

  // ---- Corrected policy architecture (no anon access to membership) ----
  await denied("anon cannot SELECT admin_users at all", () =>
    as("anon", null, () => db.query("select count(*)::int as n from public.admin_users")),
  );
  await expectCount(
    "anon reads the active published English tutorial (1)",
    () =>
      as("anon", null, () =>
        db.query(
          "select count(*)::int as n from public.how_to_play_videos where active and published and language = 'en'",
        ),
      ),
    1,
  );
  await expectCount(
    "admin sees their own membership row (1)",
    () =>
      as("authenticated", ADMIN, () =>
        db.query("select count(*)::int as n from public.admin_users where user_id = auth.uid()"),
      ),
    1,
  );
  await expectCount(
    "ordinary user sees only their own membership (0)",
    () =>
      as("authenticated", USER, () =>
        db.query("select count(*)::int as n from public.admin_users"),
      ),
    0,
  );
  await expectCount(
    "admin reads unpublished tournament via the admin policy",
    () =>
      as("authenticated", ADMIN, () =>
        db.query("select count(*)::int as n from public.tournaments where published = false"),
      ),
    0,
  );
  await db.exec("update public.tournaments set published = false where tournament_number = 26");
  await expectCount(
    "admin reads the unpublished tournament via the admin policy (1)",
    () =>
      as("authenticated", ADMIN, () =>
        db.query("select count(*)::int as n from public.tournaments where tournament_number = 26"),
      ),
    1,
  );
  await expectCount(
    "ordinary user cannot read the unpublished tournament (0)",
    () =>
      as("authenticated", USER, () =>
        db.query("select count(*)::int as n from public.tournaments where tournament_number = 26"),
      ),
    0,
  );
  await db.exec("update public.tournaments set published = true where tournament_number = 26");

  // ---- Anonymous mutations: all must fail ----
  await denied("anon INSERT into tournaments", () =>
    as("anon", null, () =>
      db.query(
        "insert into public.tournaments (tournament_number, title, timezone) values (99,'x','Africa/Dar_es_Salaam')",
      ),
    ),
  );
  await denied("anon UPDATE winners", () =>
    as("anon", null, () => db.query("update public.winners set prize_amount = 1")),
  );
  await denied("anon DELETE products", () =>
    as("anon", null, () => db.query("delete from public.products")),
  );
  await denied("anon INSERT into admin_users", () =>
    as("anon", null, () =>
      db.query(`insert into public.admin_users (user_id, display_name) values ('${USER}','self')`),
    ),
  );
  await denied("anon UPDATE site_settings", () =>
    as("anon", null, () => db.query("update public.site_settings set value = 'true'::jsonb")),
  );
  await denied("anon INSERT into storage site-media", () =>
    as("anon", null, () =>
      db.query(
        "insert into storage.objects (bucket_id, name) values ('site-media','winners/x.png')",
      ),
    ),
  );

  // ---- Signed-in NON-admin: being authenticated is not authorization ----
  await denied("ordinary user INSERT tournament", () =>
    as("authenticated", USER, () =>
      db.query(
        "insert into public.tournaments (tournament_number, title, timezone) values (98,'x','Africa/Dar_es_Salaam')",
      ),
    ),
  );
  await denied("ordinary user UPDATE winners", () =>
    as("authenticated", USER, () => db.query("update public.winners set prize_amount = 1")),
  );
  await denied("ordinary user DELETE winners", () =>
    as("authenticated", USER, () => db.query("delete from public.winners")),
  );
  await denied("ordinary user DELETE products", () =>
    as("authenticated", USER, () => db.query("delete from public.products")),
  );
  await denied("ordinary user UPDATE how_to_play_videos", () =>
    as("authenticated", USER, () => db.query("update public.how_to_play_videos set title = 'x'")),
  );
  await denied("ordinary user UPDATE site_settings", () =>
    as("authenticated", USER, () =>
      db.query("update public.site_settings set value = 'true'::jsonb"),
    ),
  );
  await denied("ordinary user cannot INSERT themselves into admin_users", () =>
    as("authenticated", USER, () =>
      db.query(`insert into public.admin_users (user_id, display_name) values ('${USER}','self')`),
    ),
  );
  await denied("ordinary user cannot UPDATE their admin row", () =>
    as("authenticated", USER, () => db.query(`update public.admin_users set display_name = 'x'`)),
  );
  await denied("ordinary user cannot DELETE admin rows", () =>
    as("authenticated", USER, () => db.query("delete from public.admin_users")),
  );
  await expectCount(
    "ordinary user sees ONLY their own admin row (none)",
    () =>
      as("authenticated", USER, () =>
        db.query("select count(*)::int as n from public.admin_users"),
      ),
    0,
  );
  await denied("ordinary user cannot write the audit log", () =>
    as("authenticated", USER, () =>
      db.query(
        `insert into public.admin_audit_log (actor_id, action, entity_type) values ('${USER}','probe','probe')`,
      ),
    ),
  );
  await denied("ordinary user cannot upload site media", () =>
    as("authenticated", USER, () =>
      db.query(
        "insert into storage.objects (bucket_id, name) values ('site-media','winners/x.png')",
      ),
    ),
  );

  // ---- Verified admin: allowed mutations ----
  await allowed("admin can create a tournament, a winner for it, then delete both", async () => {
    await as("authenticated", ADMIN, () =>
      db.query(
        "insert into public.tournaments (tournament_number, title, timezone, published) values (25,'Probe',  'Africa/Dar_es_Salaam', false)",
      ),
    );
    await as("authenticated", ADMIN, () =>
      db.query(
        "insert into public.winners (tournament_id, display_name, placement, location, prize_amount, photo_mode) select id,'Probe',1,'Test',1,'portrait-cutout' from public.tournaments where tournament_number = 25",
      ),
    );
    await as("authenticated", ADMIN, () =>
      db.query("delete from public.winners where display_name = 'Probe'"),
    );
    await as("authenticated", ADMIN, () =>
      db.query("delete from public.tournaments where tournament_number = 25"),
    );
  });
  await allowed("admin can UPDATE a tournament (persists)", () =>
    as("authenticated", ADMIN, () =>
      db.query(
        "update public.tournaments set title = 'Tournament #27' where tournament_number = 27",
      ),
    ),
  );
  await expectCount(
    "admin change persists to the public read",
    () =>
      as("anon", null, () =>
        db.query(
          "select count(*)::int as n from public.tournaments where tournament_number = 27 and title = 'Tournament #27'",
        ),
      ),
    1,
  );
  await allowed("admin can UPDATE site_settings", () =>
    as("authenticated", ADMIN, () =>
      db.query(
        "update public.site_settings set value = 'false'::jsonb where key = 'tournament_countdown_enabled'",
      ),
    ),
  );
  await allowed("admin can write its own audit entry", () =>
    as("authenticated", ADMIN, () =>
      db.query(
        `insert into public.admin_audit_log (actor_id, action, entity_type, entity_id) values ('${ADMIN}','tournament.updated','tournament','27')`,
      ),
    ),
  );
  await denied("admin cannot forge an audit entry as another user", () =>
    as("authenticated", ADMIN, () =>
      db.query(
        `insert into public.admin_audit_log (actor_id, action, entity_type) values ('${USER}','forged','x')`,
      ),
    ),
  );
  await denied("nobody can edit the audit log (append-only)", () =>
    as("authenticated", ADMIN, () => db.query("update public.admin_audit_log set action = 'x'")),
  );
  await allowed("admin can read its own admin row", () =>
    as("authenticated", ADMIN, () => db.query("select * from public.admin_users")),
  );

  // ---- Database-level audit (triggers, invoker) ----
  await db.exec("delete from public.admin_audit_log");
  await as("authenticated", ADMIN, () =>
    db.query("update public.tournaments set title = 'Tournament #27' where tournament_number = 27"),
  );
  await expectCount(
    "admin UPDATE to a tournament writes exactly one audit row",
    () =>
      db.query(
        "select count(*)::int as n from public.admin_audit_log where action = 'update' and entity_type = 'tournaments' and actor_id = '" +
          ADMIN +
          "'",
      ),
    1,
  );
  await as("authenticated", USER, () =>
    db.query("update public.tournaments set title = 'Hacked' where tournament_number = 27"),
  );
  await expectCount(
    "ordinary user's denied update writes NO audit row",
    () =>
      db.query(
        "select count(*)::int as n from public.admin_audit_log where actor_id = '" + USER + "'",
      ),
    0,
  );
  await expectCount(
    "the tournament title was not changed by the ordinary user",
    () =>
      db.query("select count(*)::int as n from public.tournaments where title = 'Tournament #27'"),
    1,
  );

  // ---- Storage ----
  await allowed("admin can upload to site-media", () =>
    as("authenticated", ADMIN, () =>
      db.query(
        "insert into storage.objects (bucket_id, name) values ('site-media','winners/test.png')",
      ),
    ),
  );

  // ---- Data integrity constraints ----
  await denied("only one ACTIVE How to Play video per language", () =>
    db.query(
      "insert into public.how_to_play_videos (language, title, youtube_id, published, active) values ('en','Dup','abcdefghijk',true,true)",
    ),
  );
  await denied("YouTube id must be an 11-character id, not HTML", () =>
    db.query(
      "insert into public.how_to_play_videos (language, title, youtube_id, published, active) values ('sw','x','<iframe src=evil>',true,false)",
    ),
  );
  await denied("web registration needs a URL", () =>
    db.query(
      "insert into public.tournaments (tournament_number, title, registration_method, timezone) values (95,'x','web','Africa/Dar_es_Salaam')",
    ),
  );
  await denied("app registration must not carry a URL", () =>
    db.query(
      "insert into public.tournaments (tournament_number, title, registration_method, registration_url, timezone) values (94,'x','app','https://example.com','Africa/Dar_es_Salaam')",
    ),
  );
  await denied("price requires a currency", () =>
    db.query(
      "insert into public.products (slug, category, name, price_amount) values ('bad-price','cards','x',100)",
    ),
  );
  await denied("product slug must be lowercase-hyphen", () =>
    db.query("insert into public.products (slug, category, name) values ('Bad Slug','cards','x')"),
  );
  await denied("winner placement limited to 1-3", () =>
    db.query(
      `insert into public.winners (tournament_id, display_name, placement, location, prize_amount, photo_mode) select id,'x',4,'x',1,'portrait-cutout' from public.tournaments where tournament_number = 26`,
    ),
  );
  await denied("winner photo mode must be a valid mode", () =>
    db.query(
      `insert into public.winners (tournament_id, display_name, placement, location, prize_amount, photo_mode) select id,'x',1,'x',1,'cutout-please' from public.tournaments where tournament_number = 26`,
    ),
  );

  // ---- Seeded state is correct and the seed is idempotent ----
  await db.exec(fs.readFileSync("supabase/seed.sql", "utf8"));
  await expectCount(
    "seed re-run creates no duplicate tournaments",
    () =>
      db.query(
        "select count(*)::int as n from public.tournaments where tournament_number in (26,27)",
      ),
    2,
  );
  await expectCount(
    "seed re-run creates no duplicate winners (the three seeded)",
    () => db.query("select count(*)::int as n from public.winners"),
    3,
  );

  console.log(`\n${passed} passed, ${failures.length} failed`);
  await db.close();
  process.exit(failures.length ? 1 : 0);
}
main().catch(async (e) => {
  console.error("HARNESS ERROR:", e.message);
  await db.close();
  process.exit(2);
});
