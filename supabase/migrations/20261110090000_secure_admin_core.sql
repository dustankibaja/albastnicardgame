-- ALBASTINI — secure admin core schema.
-- Authorization rule: a user is an administrator ONLY if a row exists in admin_users
-- for their auth.uid(). Being signed in is not enough. No SECURITY DEFINER functions.

-- =========================================================================
-- Shared helpers
-- =========================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =========================================================================
-- admin_users — who may administer the site. Provisioned only by trusted DB access.
-- =========================================================================

create table public.admin_users (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  created_at   timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- A signed-in user may learn whether THEIR OWN row exists. Nothing else.
create policy admin_users_read_own on public.admin_users
  for select to authenticated
  using (user_id = auth.uid());

-- Deliberately NO insert, update or delete policy for any client role.

revoke all on public.admin_users from anon, authenticated;
-- anon needs SELECT so that policies which evaluate is_albastini_admin() return
-- "not an admin" (zero rows) instead of a permission error. The only read policy
-- above is for authenticated, so anon still sees no rows.
grant select on public.admin_users to anon, authenticated;

-- The single authorization predicate used by every admin policy.
-- SECURITY INVOKER: it reads admin_users under the caller's own RLS, and admin_users
-- only lets a user see their own row. It cannot grant anything by itself.
create or replace function public.is_albastini_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  );
$$;

-- =========================================================================
-- tournaments
-- =========================================================================

create table public.tournaments (
  id                   uuid primary key default gen_random_uuid(),
  tournament_number    integer not null unique check (tournament_number > 0),
  title                text not null check (char_length(title) between 1 and 160),
  starts_at            timestamptz,
  timezone             text not null default 'Africa/Dar_es_Salaam'
                         check (timezone = 'Africa/Dar_es_Salaam'),
  status               text not null default 'upcoming'
                         check (status in ('upcoming', 'completed', 'postponed', 'cancelled')),
  registration_method  text not null default 'app' check (registration_method in ('app', 'web')),
  registration_url     text check (registration_url is null or registration_url ~ '^https://[^\s]+$'),
  play_mode            text not null default 'on_app' check (play_mode in ('on_app')),
  published            boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  -- web registration needs a URL; app registration must not carry one
  constraint tournaments_registration_consistent check (
    (registration_method = 'web' and registration_url is not null)
    or (registration_method = 'app' and registration_url is null)
  )
);

create trigger tournaments_touch before update on public.tournaments
  for each row execute function public.touch_updated_at();

alter table public.tournaments enable row level security;

create policy tournaments_public_read on public.tournaments
  for select to anon, authenticated
  using (published = true or public.is_albastini_admin());

create policy tournaments_admin_insert on public.tournaments
  for insert to authenticated
  with check (public.is_albastini_admin());

create policy tournaments_admin_update on public.tournaments
  for update to authenticated
  using (public.is_albastini_admin())
  with check (public.is_albastini_admin());

create policy tournaments_admin_delete on public.tournaments
  for delete to authenticated
  using (public.is_albastini_admin());

revoke all on public.tournaments from anon, authenticated;
grant select on public.tournaments to anon, authenticated;
grant insert, update, delete on public.tournaments to authenticated;

-- =========================================================================
-- winners
-- =========================================================================

create table public.winners (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references public.tournaments (id) on delete cascade,
  display_name    text not null check (char_length(display_name) between 1 and 80),
  placement       integer not null check (placement between 1 and 3),
  location        text not null check (char_length(location) between 1 and 120),
  prize_amount    integer not null check (prize_amount >= 0),
  currency        text not null default 'TZS' check (currency = 'TZS'),
  image_path      text,
  photo_mode      text not null check (photo_mode in ('portrait-cutout', 'editorial-photo')),
  sort_order      integer not null default 0,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tournament_id, placement)
);

create trigger winners_touch before update on public.winners
  for each row execute function public.touch_updated_at();

alter table public.winners enable row level security;

create policy winners_public_read on public.winners
  for select to anon, authenticated
  using (published = true or public.is_albastini_admin());

create policy winners_admin_insert on public.winners
  for insert to authenticated
  with check (public.is_albastini_admin());

create policy winners_admin_update on public.winners
  for update to authenticated
  using (public.is_albastini_admin())
  with check (public.is_albastini_admin());

create policy winners_admin_delete on public.winners
  for delete to authenticated
  using (public.is_albastini_admin());

revoke all on public.winners from anon, authenticated;
grant select on public.winners to anon, authenticated;
grant insert, update, delete on public.winners to authenticated;

-- =========================================================================
-- products — Shop. Price is nullable: never invent a price.
-- =========================================================================

create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category        text not null check (char_length(category) between 1 and 60),
  name            text not null check (char_length(name) between 1 and 120),
  description     text check (char_length(description) <= 1000),
  name_sw         text check (name_sw is null or char_length(name_sw) between 1 and 120),
  description_sw text check (description_sw is null or char_length(description_sw) <= 1000),
  image_path      text,
  price_amount    integer check (price_amount is null or price_amount >= 0),
  currency        text check (currency is null or currency = 'TZS'),
  availability    text not null default 'coming_soon'
                    check (availability in ('available', 'unavailable', 'coming_soon')),
  featured        boolean not null default false,
  sort_order      integer not null default 0,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint products_price_has_currency check (price_amount is null or currency is not null)
);

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

create policy products_public_read on public.products
  for select to anon, authenticated
  using (published = true or public.is_albastini_admin());

create policy products_admin_insert on public.products
  for insert to authenticated
  with check (public.is_albastini_admin());

create policy products_admin_update on public.products
  for update to authenticated
  using (public.is_albastini_admin())
  with check (public.is_albastini_admin());

create policy products_admin_delete on public.products
  for delete to authenticated
  using (public.is_albastini_admin());

revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- =========================================================================
-- how_to_play_videos — stores a YouTube ID only. Never accepts iframe HTML.
-- =========================================================================

create table public.how_to_play_videos (
  id          uuid primary key default gen_random_uuid(),
  language    text not null check (language in ('en', 'sw')),
  title       text not null check (char_length(title) between 1 and 160),
  youtube_id  text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  published   boolean not null default false,
  active      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- At most one ACTIVE video per language.
create unique index how_to_play_one_active_per_language
  on public.how_to_play_videos (language) where active;

create trigger how_to_play_touch before update on public.how_to_play_videos
  for each row execute function public.touch_updated_at();

alter table public.how_to_play_videos enable row level security;

create policy how_to_play_public_read on public.how_to_play_videos
  for select to anon, authenticated
  using (published = true or public.is_albastini_admin());

create policy how_to_play_admin_insert on public.how_to_play_videos
  for insert to authenticated
  with check (public.is_albastini_admin());

create policy how_to_play_admin_update on public.how_to_play_videos
  for update to authenticated
  using (public.is_albastini_admin())
  with check (public.is_albastini_admin());

create policy how_to_play_admin_delete on public.how_to_play_videos
  for delete to authenticated
  using (public.is_albastini_admin());

revoke all on public.how_to_play_videos from anon, authenticated;
grant select on public.how_to_play_videos to anon, authenticated;
grant insert, update, delete on public.how_to_play_videos to authenticated;

-- =========================================================================
-- site_settings — a small key/value list for genuinely dynamic behaviour only.
-- Only rows flagged is_public are readable by the website.
-- =========================================================================

create table public.site_settings (
  key         text primary key check (key ~ '^[a-z_]+$'),
  value       jsonb not null,
  is_public   boolean not null default false,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

create policy site_settings_public_read on public.site_settings
  for select to anon, authenticated
  using (is_public = true or public.is_albastini_admin());

create policy site_settings_admin_insert on public.site_settings
  for insert to authenticated
  with check (public.is_albastini_admin());

create policy site_settings_admin_update on public.site_settings
  for update to authenticated
  using (public.is_albastini_admin())
  with check (public.is_albastini_admin());

create policy site_settings_admin_delete on public.site_settings
  for delete to authenticated
  using (public.is_albastini_admin());

revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- =========================================================================
-- admin_audit_log — who changed what. Never stores passwords, tokens or secrets.
-- =========================================================================

create table public.admin_audit_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid not null references auth.users (id) on delete restrict,
  action       text not null check (char_length(action) between 1 and 80),
  entity_type  text not null check (char_length(entity_type) between 1 and 60),
  entity_id    text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

-- Only administrators can write entries, and only as themselves.
create policy audit_admin_insert on public.admin_audit_log
  for insert to authenticated
  with check (actor_id = auth.uid() and public.is_albastini_admin());

create policy audit_admin_read on public.admin_audit_log
  for select to authenticated
  using (public.is_albastini_admin());

-- No update or delete policy: the log is append-only for clients.

revoke all on public.admin_audit_log from anon, authenticated;
grant select, insert on public.admin_audit_log to authenticated;

-- =========================================================================
-- Storage — public read of site media; only verified admins may write.
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

-- Explicit privileges. RLS below decides who may actually do what.
grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

create policy site_media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-media');

create policy site_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_albastini_admin());

create policy site_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and public.is_albastini_admin())
  with check (bucket_id = 'site-media' and public.is_albastini_admin());

create policy site_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and public.is_albastini_admin());
