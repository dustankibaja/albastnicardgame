# Phase 4: Real-asset integration and human/product polish

Status: built, awaiting design review. Phase 5 not started.

## A. Assets integrated (all `real_source_photo`)
Originals stored untouched in `assets-source/phase4/` (SHA-256 verified against
MANIFEST.csv; not bundled). Derivatives documented in
`assets-source/phase4/DERIVATIVES.md`.

| Registry id | Derivative | Used in |
|---|---|---|
| `davidSanyaPortrait` | `src/assets/photos/david-sanya-portrait.png` | Competition winner feature |
| `cardsOnTable` | `src/assets/photos/cards-on-table.jpg` | Two Ways headline strip |
| `cardFrontsOnWhite` | `src/assets/photos/card-fronts-on-white.png` | Physical Cards product stage |

## B. David portrait
- Three crops tested (wide / medium / tight). Chosen: **medium**, face +
  hand-to-chin gesture + collar. Wide let the bright shirt dominate; tight
  magnified past source quality.
- Background separated with an alpha matte (`isnet-general-use`); the
  `u2net_human_seg` matte was rejected (holes through the shirt). Largest
  region kept. Uniform gamma 0.88 lifts the backlit face. No pixel of the
  person generated, moved or retouched.
- Phase 3 portrait system reused: portrait in front of the outlined `1`,
  soft radial mask (no rectangular edge on any side), name/prize/location
  beside it on desktop, stacked below it under 1024px.

## C. Real card photography
- **Table photo → Two Ways.** Strip behind "From the table. To the screen.";
  the hero blue flows onto it along the card-wave, the interactive hand rests
  on its lower edge. Overlay gives worst-case headline contrast ≥ 10:1 white,
  ≥ 7.8:1 yellow. Chapter height: desktop +2.1%, mobile +3.3% vs Phase 3
  (hero+Two Ways combined: desktop −3.7%).
- **Card-fronts photo → Physical Cards.** Lies beneath the boxes; its pure
  white ground merges with the page. Anchored 12px below the arena edge
  (parallax capped at 10px) so its white never shows over the night blue.
  Replaces the temporary-reference ace in this chapter.
- The table photo shows the genuine card **back**. Angled and partly covered,
  so not a usable back asset: flips stay off. Its printed URL is not linked.

## D. Still `temporary_reference`
`aceRed`, `aceBlack`, `aceBlue` (hero hand and Two Ways hand). Not promoted.

## E. Performance
Lazy, `fetchpriority=low`, one AVIF per photo, sized per device (verified by
network capture). Whole-page cost of the three photos: 109.8 KB on a 2× phone
(table 42.7, portrait 37.1, fronts 30.0); 175.9 KB on desktop 1×. Hero first
view unchanged.

## Other fixes
- Sticky nav: full-page overlap is a screenshot-stitching artifact. Real issue
  found and fixed: "Physical cards" anchor landed with the product under the
  bar; its scroll margin now includes the stage pull-up.
- Hero/Two Ways seam: the hero's white wave left a straight-edged white band
  over the photo; the wave now belongs to the strip (blue → table directly).

## G. Remaining blockers
Official card scans (to replace the temporary aces) · official wordmark ·
additional/higher-res app screenshots · cleared community photography ·
higher-resolution product photography · an official card-back scan (only if
flip interactions are ever wanted).
