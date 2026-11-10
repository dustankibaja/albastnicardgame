-- Database-level audit for tracked content tables.
-- SECURITY INVOKER: the trigger runs with the CALLER's privileges. It inserts into
-- admin_audit_log under that caller's RLS policy, which accepts only verified
-- administrators writing their own actor_id. No SECURITY DEFINER is used.
-- A change made with no signed-in user (for example the seed) is not an admin action
-- and is intentionally not recorded.
-- Stores operation, table, row id and minimal metadata only. Never row contents
-- that could hold secrets, and never tokens or passwords.

create or replace function public.audit_content_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  rec jsonb;
  row_id text;
begin
  if actor is null then
    return null; -- not an authenticated administrator action: nothing to attribute
  end if;
  -- Identify the row generically: most tables use id; site_settings uses key.
  if tg_op = 'DELETE' then
    rec := to_jsonb(old);
  else
    rec := to_jsonb(new);
  end if;
  row_id := coalesce(rec->>'id', rec->>'key');
  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    lower(tg_op),
    tg_table_name,
    row_id,
    jsonb_build_object('table', tg_table_name, 'operation', tg_op)
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger tournaments_audit after insert or update or delete on public.tournaments
  for each row execute function public.audit_content_change();
create trigger winners_audit after insert or update or delete on public.winners
  for each row execute function public.audit_content_change();
create trigger products_audit after insert or update or delete on public.products
  for each row execute function public.audit_content_change();
create trigger how_to_play_audit after insert or update or delete on public.how_to_play_videos
  for each row execute function public.audit_content_change();
create trigger site_settings_audit after insert or update or delete on public.site_settings
  for each row execute function public.audit_content_change();
