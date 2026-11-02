# Admin prototype (disabled in Phase 1)

These files were the `/auth` and `/admin` routes and the "mock backend" they used.
They were **removed from the app** in Phase 1 and are kept here only for reference.

## Why it was disabled

- The password was the literal string `"admin"`.
- The session cookie was unsigned: sending `admin_session=true` was enough to open `/admin`
  (confirmed against the dev server before removal).
- Anyone with that cookie could edit the tournament, delete winners, and read the
  email addresses submitted through the card notify form.
- `db.ts` wrote to `db.json` on the server filesystem. On Vercel that filesystem is
  read-only, so writes lived only in one serverless instance's memory and were lost
  on cold start. In local dev it created `src/api/db.json` inside the source tree.

## Why nothing here is reachable

- Nothing under `archive/` is inside `src/`, so the TanStack router does not generate
  routes for it and no server functions from it are bundled.
- `archive/` is excluded from TypeScript and ESLint.

## Before reviving any of this

1. Choose and approve a real backend (persistent, access-controlled storage).
2. Use a real identity provider or signed, expiring sessions. Never a shared literal password.
3. Treat signup data as personal data: consent wording, retention and access control first.
