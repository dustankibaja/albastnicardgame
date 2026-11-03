# Phase 5: Launch polish, content readiness and production QA

Status: complete, awaiting launch decision. No Phase 6 started.

## Controlled tests (decisions)
| Test | Result | Decision |
|---|---|---|
| David portrait A (current) vs B (+12.5%) at 1024/1440/1920 | B pushed his head 39px above the article (toward "They played. They won."), covered the "1st place" chip at 1024, raised his share of the section 27%→30% | **A kept** — no code change |
| Portrait colour | Cheek/neck skin is warm (R−B +24/+16); cool readings on forehead/nose are real window daylight. Pipeline adds no cast (original = derivative = rendered within 0.3° hue) | **No adjustment** (a global warming would falsify the scene's light) |
| Physical Cards mobile A vs B (expansion subordinated) at 320/375/430 | B: Safari box 5.6× the expansion's area (was 3.4×), boxes no longer overlap, card fronts read more clearly | **B below 1024px**; desktop unchanged |

## Bugs found and fixed (all verified by automated sweeps)
- 320px: card-fronts photo (anchored in Phase 4) covered "TAKE THE GAME" → stage taller below 1024px.
- 1024–1279px: Two Ways copy overflowed its grid column; widening it then collided with the rising phone → full row + 17rem panel cap in that range (zero collisions 1024–1920).
- 1920px+: "TWO WAYS" overflowed the hero column by 91px (pre-existing, hidden by clip) → size capped where it fits.
- 768px: card-hand panel pushed off-screen by a min-width → min-width only ≥1024px.
- Phrase splits: "From the / table." (320), orphaned "move", "game", "November", "One / Albastini." (1920+) → protected phrase spans; zero splits/orphans 320–2560.
- 320px: tournament date's min-content widened the grid and clipped the description → date sized to fit + `minmax(0,1fr)` grid.
- ≥2200px: content floated in empty blue → proportional scale (width and root type ×1.19).
- Headline over photo had no dark fallback (if the image failed, yellow on white) → dark base under the strip.
- Duplicate landmark names (header/footer nav both "Main"; menu dialog and its nav) → unique labels.

## Content systems (proved by data-only tests, files restored byte-identical)
- Tournament with number/mode/start time/registration URL → heading, Tanzania time, mode, countdown and a real registration link render; no component edits.
- No upcoming tournament → honest "will be announced soon".
- Winners: 2, 3 (supplied unsorted) → rendered 1→2→3; 0 → winner block hidden.
- Both store links withdrawn → dialog shows "coming soon", no dead buttons.
- Timezone: typed to `Africa/Dar_es_Salaam`; another zone fails type-checking rather than rendering wrong times (lib change required by design).

## Metadata / SEO
Title, description, Open Graph (site name, title, description, type, locales en_TZ / sw_TZ), Twitter title/description, favicon, Apple touch icon, theme colour, robots. Canonical, og:url, sitemap and Organization/WebSite JSON-LD appear **only when `VITE_SITE_URL` is set** (verified both ways). Social card is "summary" until approved 1200×630 artwork exists. No ratings, prices, availability or event data.

## Performance (4× CPU-throttled phone)
CLS 0 (load and full scroll) · no long tasks while scrolling · 4 scroll / 2 pointer / 2 resize listeners total · motion: transform-only, offscreen-paused, reduced-motion static.
Bundle: JS 107.9 KB + 26.3 KB gz (framework; zero unused libraries shipped) · CSS 16.6 → **9.3 KB gz** (unused UI kit excluded; pixel-diff verified) · fonts 61 KB self-hosted.

## Accessibility
axe-core (WCAG 2.2 AA + best practice): **0 violations** in 7 states (desktop/mobile, EN/SW, dialog open, menu open). Keyboard, focus trap, Escape, reduced motion, JS-off all pass.

## Browser QA
Chromium: full automated suite. Firefox/WebKit could not be installed in this environment (download blocked by network policy). Static audit of shipped CSS vs last 3 Firefox / Safari / iOS versions: only cosmetic items (iOS ignores ::selection, resize, cursors; Firefox `ui-sans-serif` falls through to the stack). All layout-critical features supported (mask-image, color-mix, variable font-stretch, overflow:clip, aspect-ratio). AVIF falls back to WebP via `<picture>` type selection.
**Before launch, spot-check on a real iPhone (Safari) and Firefox:** portrait mask edges, the table-strip overlay, the mobile menu, the download dialog.

## Build hygiene (production scan)
No admin prototype, originals, private source photos, uncompressed sources, placeholders, stale tournaments, stand-in people, personal app data or unused reference assets ship. Only AVIF/WebP derivatives + brand mark + favicon/touch icon.

## Hand-off documents
- `docs/ASSET-SPECS.md` — community shot list, card scans, card back, app screenshots, wordmark slot, OG image, product photos
- `docs/CTA-AUDIT.md` — every CTA, EN/SW, destination, verification, desktop/mobile
- `docs/LANGUAGE-REVIEW.md` — all 102 public strings side by side for a native reviewer
- `assets-source/README.md` — provenance index (status, source, checksum, usage)

## Launch checklist (blocked only on verified inputs)
1. Confirm App Store / Play links → `src/content/links.ts` (`verified: true`).
2. Confirm production domain → set `VITE_SITE_URL` (enables canonical, sitemap, JSON-LD).
3. 21 Nov tournament: number, mode, start time, registration URL → `src/content/tournaments.ts`.
4. Native Kiswahili review → `src/lib/i18n.tsx`.
5. Real-device spot check (iOS Safari, Firefox).
Optional when supplied: official card scans, wordmark, app screenshots, community photos, OG artwork, hi-res product photos, card-form backend.
