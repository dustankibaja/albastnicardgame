# Albastini admin — setup

Status: schema, authorization and tests are in the repository. The live Supabase
connection and the admin screens are still to be connected. See "Current state".

## 1. Create or select the Supabase project
Use the project that belongs to Albastini. Do not create a second project for the same site.

## 2. Run the migrations
From the repository (requires the Supabase CLI, linked to the project):

    supabase link --project-ref <project-ref>
    supabase db push                 # applies supabase/migrations/*
    supabase db execute --file supabase/seed.sql   # idempotent; safe to re-run

Never run `supabase db reset` against production: it erases data.

## 3. Obtain the public values
In the Supabase dashboard → Project Settings → API:
- Project URL → `VITE_SUPABASE_URL`
- Publishable key → `VITE_SUPABASE_PUBLISHABLE_KEY`

These two values are public by design. Protection comes from row-level security.

## 4. Configure local environment
Copy `.env.example` to `.env.local` and fill the values above. `.env.local` is git-ignored.

## 5. Configure Vercel environment
Vercel → Project `albastnicardgame` → Settings → Environment Variables:
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, for Production and Preview.
Do not add any service-role or secret key.

## 6. Create the admin Auth user (manual, owner only)
Supabase dashboard → Authentication → Users → Add user → email and password.
Public sign-up is not offered: this is the only way accounts are created.

## 7. Grant admin access (owner only)
Copy the new user's UUID from the Users list, then run once in the SQL editor
(replace the placeholders; do not paste a UUID you have not verified):

    insert into public.admin_users (user_id, display_name)
    values ('<USER-UUID>', '<display name>');

Only a row in `admin_users` makes someone an administrator. Having a Supabase
account, or any user metadata, does not.

## 8. Deploy the preview
Push the branch. Vercel builds a preview. Confirm the build has both
`VITE_SUPABASE_*` values.

## 9. Visit `/admin/login`
Sign in with the admin account.

## 10. Test login
- Signed out, `/admin` redirects to `/admin/login`.
- A signed-in non-admin is refused.
- The admin reaches the dashboard.
- Log out, then use Back: no admin data is shown.

## 11. Verify the public site reads CMS data
Change a published value in the admin (for example a winner's location) and reload
the public site. The change should appear. Unpublish it and it should disappear.

## Current state
- DONE: schema migration, seed, row-level security, explicit grants, storage bucket
  and policies, and the authorization test suite (`npm run test:db`, 44 checks).
- NOT YET: Supabase Auth wiring in the app, `/admin` screens, public-site data
  integration, and fallback to the verified static content.

## Environment variables
| Name | Public? | Where |
|---|---|---|
| VITE_SITE_URL | public | build |
| VITE_SUPABASE_URL | public | build |
| VITE_SUPABASE_PUBLISHABLE_KEY | public (RLS-protected) | build |
| SUPABASE_SERVICE_ROLE_KEY | SECRET — never used here | — |
| Database password | SECRET — never in repo | — |
