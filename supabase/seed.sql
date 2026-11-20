-- ALBASTINI — verified current content. Idempotent: safe to re-run.
-- Only verified values are seeded. No prices, no invented products or winners.
-- Existing rows are never overwritten (on conflict do nothing).

insert into public.tournaments
  (tournament_number, title, starts_at, timezone, status, registration_method, play_mode, published)
values
  -- Owner-confirmed: Saturday 12 December 2026, 8:00 PM EAT (Africa/Dar_es_Salaam, UTC+3)
  (27, 'Tournament #27', '2026-12-12 20:00:00+03', 'Africa/Dar_es_Salaam', 'upcoming', 'app', 'on_app', true),
  -- Tournament #26: completed, 26 September 2026. Start time not recorded.
  (26, 'Tournament #26', null, 'Africa/Dar_es_Salaam', 'completed', 'app', 'on_app', true)
on conflict (tournament_number) do nothing;

insert into public.winners
  (tournament_id, display_name, placement, location, prize_amount, currency, photo_mode, sort_order, published)
select t.id, w.display_name, w.placement, w.location, w.prize_amount, 'TZS', w.photo_mode, w.placement, true
from public.tournaments t
cross join (values
  ('David Sanya', 1, 'Dar es Salaam, Tanzania', 130000, 'portrait-cutout'),
  ('Bedadi',      2, 'Kilimanjaro, Tanzania',   65000,  'editorial-photo'),
  ('MJeshi',      3, 'Iringa, Tanzania',        26000,  'portrait-cutout')
) as w(display_name, placement, location, prize_amount, photo_mode)
where t.tournament_number = 26
on conflict (tournament_id, placement) do nothing;

insert into public.products
  (slug, category, name, description, name_sw, description_sw, availability, featured, sort_order, published)
values
  ('physical-cards', 'cards', 'Physical Cards',
   'Physical Albastini cards are made for real tables, real friends and one more game.',
   null, null, 'coming_soon', true, 1, true)
on conflict (slug) do nothing;

insert into public.how_to_play_videos (language, title, youtube_id, published, active)
values ('en', 'How to Play Albastini — official tutorial in English', 'wGd1QJHSU0E', true, true)
on conflict (language) where active do nothing;

insert into public.site_settings (key, value, is_public)
values ('tournament_countdown_enabled', 'false'::jsonb, true)
on conflict (key) do nothing;
