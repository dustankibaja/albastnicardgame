# Phase 1: Stabilization, data integrity and foundation

Branch: `phase-1-stabilization`. No visual redesign; that is Phase 2.

## Removed from the public site

| Removed | Why |
|---|---|
| Stats: 128,400+ games, 9,250+ players, 4,820,000+ coins | Placeholders (the code said so) |
| 4 winners named "Winner name pending" | Not real records |
| Their prizes (TSh 2,000,000 / 1,000,000 / 500,000 / 1,500,000), dates (June 2026, Nov 2025), cities (Mwanza, Arusha) | Invented |
| 4 stand-in winner portraits (`winner-1..4.jpg`) | Not winners; files deleted |
| Tournament #25 (27 Aug 2026, Dar es Salaam, TSh 250,000, "64 players · knockout") | Stale and unverified |
| "Live now 00:00:00:00" | Showed permanently for a past event |
| "54 cards", "Points chips", "Rigid box", "The Safari Edition deck is coming" | Unverified product claims |
| "Get the physical cards" / "Pata karata halisi" | Implied purchase is possible |
| "Qualify in the app, show up, take the crown"; "Ranked tables"; "Played in … bars nationwide"; "Quick matches, ranked tables and tournament qualifiers" | Unverified claims (and contradict app-only #27) |
| "You're on the list" after an unsaved submission | Fake success |
| `players.jpg` | Provenance unverified; file deleted |
| Personal account name, avatar and coin balance in the app screenshot | Privacy; screenshot cropped below the profile bar |
| Typed "Albastini" wordmark next to the logo | Not the official wordmark |
| "INGIA UWANJANI TIUCHEZE" | Typo; official phrase is "INGIA UWANJANI TUCHEZE." (punctuation corrected in the final handoff) |
| Light/dark theme toggle | CEO: one cohesive theme |
| Intro feature grid, Stats section, standalone App section | Unverified claims / CEO structure |

Note: deleted files and the uncropped screenshot still exist in git history and in
any old deployments. If that matters (personal data in the screenshot), ask before
rewriting history: this repo syncs with Lovable.

## Security: `/auth` and `/admin`

Disabled. Code moved to `archive/admin-prototype/` (outside `src/`, excluded from
TypeScript and ESLint), so no routes are generated and no server functions are
bundled. Verified: `/admin` and `/auth` return 404, including with a forged
`admin_session=true` cookie, and the production build contains none of the admin
server functions. See `archive/admin-prototype/README.md` before reviving it.

## Content now on the site (all verified)

- Winner: David Sanya, 1st place, Dar es Salaam, Tanzania, TZS 130,000. No tournament
  attached (unverified), no portrait.
- Tournament #27: 31 Oct 2026, 8:00 PM, app-only, status `completed`. Kept in data; not
  displayed because no verified results exist.
- Next tournament: 21 Nov 2026. Shown as the date plus "Start time and details coming
  soon." No number, mode, start time or countdown until verified.

## Waiting on the Albastini team

- Official full logo (SVG preferred) → `src/content/brand.ts`
- Verified App Store and Google Play links → `src/content/links.ts`
- 21 Nov tournament: start time, mode, number, registration destination
- Tournament #27 results, if they should be published
- David Sanya: portrait + consent; which tournament he won, if it should be shown
- Physical cards: what the product contains, availability, and (later) pricing
- Backend choice for card-interest sign-ups, plus consent/privacy wording and the
  channel used to notify people
- Cleared community photography
- Full, high-resolution card scans (current files are partial crops)
- Contacts, social accounts, legal pages
- Native Kiswahili review of new copy
