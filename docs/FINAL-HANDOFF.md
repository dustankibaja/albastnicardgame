# Final handoff — implementation record

Status: complete. Ready for Vercel. No further design phase started.

## Content changes
- **Brand phrase** corrected everywhere to **INGIA UWANJANI TUCHEZE.** (copy, metadata, README, docs). One source: `brand.tagline`.
- **Tournament #27:** 12 December 2026, registration through the Albastini app, status upcoming. 31 Oct kept only as internal `previousScheduledDate`. No start time (not verified for the new date) → no countdown. Public panel: *Tournament #27 · Saturday, 12 December 2026 · Register through the Albastini app. · Start time to be announced. · PLAY ON THE APP*.
- The former "#27 completed on 31 Oct" record is removed.
- **Tournament #26** (26 September 2026, completed) added.
- **Prize structure** centralised: `tournamentPrizeStructure` = 1st 130,000 · 2nd 65,000 · 3rd 26,000 TSH. Prizes derive from placement; never stored per winner.
- **Winners** (Tournament #26, `displayName` = app/player name, never legal names): David Sanya (1st, Dar es Salaam), Bedadi (2nd, Kilimanjaro), Jeshi (3rd, Iringa).
- **Store links** marked verified (owner-confirmed); still the only place URLs live.
- **Official brand mark** (2048 px) replaces the 256 px mark in navbar/menu/footer, favicon, touch icon and the final-section card fan. Same artwork, higher resolution.
- Postponed state: a `postponed` status shows *"Postponed — new date to be announced"* and hides the stale date.

## ChampionFrame
4:5 stage, night-blue mat, restrained yellow keyline, placement badge, quiet card-wave geometry, bottom grounding fade.
Per-winner `imageFit` (`cover` / `contain`) and `imagePosition` absorb inconsistent photos without mutilating them; no photo → outlined placement numeral (never a placeholder person).
Current: David = Phase 4 cut-out (`contain`, bottom-anchored) · Bedadi = full original photo (`cover`, 55% 30%) · Jeshi = cut-out separated from the official poster (`cover`, bottom-anchored).

## ChampionsCarousel
Native horizontal scroll-snap (one slide per gesture, never skips).
- **Mobile:** native touch swipe (verified with real touch events at 320/375/430); 44 px+ targets.
- **Desktop:** previous/next arrows (disabled at the ends) + per-champion indicators.
- **Keyboard:** focusable viewport, ←/→ between champions, logical Tab order, Enter on indicators, polite live region ("3 of 3: Jeshi").
- **Reduced motion:** instant jumps. **No autoplay** (optional in the brief; omitted to avoid motion/a11y risk).
- **JS off:** all champions rendered and natively scrollable; controls not rendered (no dead buttons).
- Supports 1 (no controls), 2, 3+ winners and newer tournament groups (latest group shown) — verified by data-only tests.

## Bugs found during this pass (fixed)
- The rising Safari box (Physical Cards) covered the carousel controls on desktop → arena bottom padding now exceeds the product rise (controls clickable at 9 widths).
- Carousel viewport's rounded corner clipped "Iringa" on mobile → rounding removed.
- Postponed state showed a stale date beside "postponed" → date hidden while postponed.
- ESLint crawled `.vercel/output` (timed out) → build output and source packs ignored.

## Vercel
`VERCEL=1 npm run build` emits Build Output API v3 (Node 22 function + immutable-cached static assets). The real function was run locally: `/` 200 with #27 / 12 Dec, all three champions and prizes, correct phrase, no countdown, no "31 October"; `/admin`, `/auth`, unknown paths 404. `vercel.json` pins `npm ci` / `npm run build`. Set `VITE_SITE_URL` after the first production deploy.

## QA
Build ✅ · TypeScript ✅ · Lint 0 errors (9 pre-existing warnings) · axe-core 0 violations in 7 states (EN/SW, desktop/mobile, dialog, menu) · overflow, occlusion and phrase sweeps clean 320–2560 · Two Ways height unchanged (frozen) · hero, anchors, photo clearance unchanged · CLS 0, no long tasks (4× CPU throttle) · console errors 0 at all widths · production scan: no forbidden content or files.
Firefox/WebKit cannot be installed in this environment (network policy); static CSS audit passed in Phase 5. Spot-check on a real iPhone and Firefox before announcing.

## Needs the Albastini team
1. **Confirm the 3rd-place display name:** official poster prints **MJESHI**; handoff/README say **Jeshi** (site uses Jeshi; one-word change in `winners.ts`).
2. **Production URL** → set `VITE_SITE_URL` after the first Vercel deploy.
3. **Tournament #27 start time** (enables time + countdown automatically).
4. **Kiswahili review** (`docs/LANGUAGE-REVIEW.md`, 110 strings).
5. Optional, when available: official card scans (front + back), official wordmark, more app screenshots, cleared community photos, approved social-preview artwork, high-res product photos, card-interest backend.

Note: the asset pack's poster filenames for 1st and 3rd place are swapped (see `assets-source/README.md`).
