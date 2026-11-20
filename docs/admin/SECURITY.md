# Albastini admin — security model

## Authentication
Supabase Auth, email and password. No public registration. Accounts are created
by the owner in the Supabase dashboard. No shared password, no hard-coded
credential, no `admin=true` cookie, no authorization from user metadata.

## Authorization
Signed in is NOT enough. An administrator is a user whose auth UUID has a row in
`public.admin_users`. Every admin write policy calls `public.is_albastini_admin()`,
which checks that table for `auth.uid()`. Clients cannot insert, update or delete
`admin_users`; only trusted database access can add an administrator.

## Row-level security
RLS is enabled on every exposed table: admin_users, tournaments, winners, products,
how_to_play_videos, site_settings, admin_audit_log, and storage.objects.
- Public (anon and authenticated, non-admin) may read only published rows and public settings.
- Mutations require `is_albastini_admin()`. Update policies carry both USING and WITH CHECK.
- Anonymous users have no insert, update or delete privilege at all.
- The audit log is append-only and an administrator may write only entries that name themselves.
- No `SECURITY DEFINER` function is used. The predicate is `SECURITY INVOKER`.

## Grants
Table creation does not expose a table to the Data API. Every table revokes all
privileges from anon and authenticated, then grants only what its policies need.

## Storage
Bucket `site-media` is public-read so the website can show images. Only verified
administrators may create, change or delete objects. Anonymous uploads are refused.

## Verification
`npm run test:db` runs the real migration and seed in an embedded Postgres and
attempts each operation as anonymous, as an ordinary signed-in user, and as an
administrator. 44 checks, all passing. It does not replace a test against the live
project, which is still to be run (see SETUP.md).

## Which values are public
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are shipped to browsers.
  This is safe only because of RLS. If RLS were removed, these values would expose data.
- `VITE_SITE_URL` is public.

## Which secrets must never reach browser code or the repository
- The service role / secret key (bypasses RLS entirely)
- The database password
- JWT signing secrets
- User passwords

## Why the old prototype stays disabled
`archive/admin-prototype/` used a literal password, an unsigned cookie and a
filesystem database that cannot persist on Vercel. It is kept for reference
only, marked DO NOT RESTORE, and nothing in `src/` imports it.

## Audit
Administrative changes should be recorded in `admin_audit_log` (actor, action,
entity, timestamp, minimal metadata). Passwords, tokens and secrets are never logged.
