# Asset specifications — what the Albastini team can supply

Everything here has a ready replacement path. Supply files; the site needs no
redesign. Never supply AI-generated, stock or edited-identity imagery.

**Delivery rules for all photos:** original camera/device files (not forwarded
through WhatsApp or social apps, which recompress), sRGB, no filters, no
watermarks, no mock-ups, no device frames. Anyone identifiable must have given
consent for public use (keep a record). Send with: who took it, where, when.

## 1. Community photography (slot `communityPlay` stays empty until cleared)

| Shot | What | Orientation | Minimum | Safe area / crop | Faces | Enters the site at |
|---|---|---|---|---|---|---|
| Wide social | Friends around a table playing Albastini, cards visible | Landscape 3:2 | 2400×1600 | Keep table + cards in the central 60%; site may crop to 16:9 or 4:3 | Yes, natural, not posed to camera | Two Ways, beside the card hand (existing slot) |
| Reaction | A player laughing/reacting to a move | Portrait 4:5 | 1600×2000 | Face in upper-middle third; room above head | Yes, consent essential | Two Ways copy panel (proposed slot, one registry line) |
| Detail | Hands holding real Albastini cards, faces optional | Square 1:1 | 2000×2000 | Card faces sharp and legible; fill ≥50% of frame | Not required | Physical Cards, beside the card-fronts photo (proposed) |
| Tournament | Players competing at an Albastini event | Landscape 3:2 | 2400×1600 | Action in central 70%; avoid people cut at frame edge | Yes | Competition, between tournament panel and winners (proposed) |
| Celebration | A winner/player celebrating | Portrait 4:5 | 1600×2000 | Subject's head in top 40%; plain-ish background helps masking | Yes | Competition winners (only for a verified winner) |
| Venue | A real meet-up space where Albastini is played | Landscape 16:9 | 2560×1440 | Dark/quiet upper area preferred (text may sit over it) | Optional | Final CTA background (proposed) |

## 2. Official card scans (replace the `temporary_reference` aces)

For each card (starting with the red, black and blue aces):

- Straight-on, flat, no perspective distortion; all four edges and corners visible.
- Even, diffuse lighting; no glare or hotspots; no clipped whites/blacks.
- **Minimum 1200 px on the short edge** (≈1200×1680 for a poker-ratio card); 2000+ preferred.
- Colour-managed (sRGB, from a calibrated scanner or colour-checked capture).
- No sharpening halos, no noise reduction smearing, no JPEG artefacts (PNG or TIFF).
- Preferably transparent background after controlled extraction; otherwise pure
  white with the card fully separated from edges.
- Replace in `src/assets/`, update `scripts/optimize-images.mjs`, run it, set the
  registry entry to `official`. No layout changes.

## 3. Official card back (only needed if card flips are ever wanted)

Flips stay **off** until a genuine official back exists: straight-on, ≥1200 px
short edge, correct orientation verified, colour-accurate. The table photograph
shows backs but does **not** qualify (angled, partly covered).

## 4. App screenshots

| # | Screen | Use |
|---|---|---|
| 1 | Home | Already used (current crop) — a clean resupply would sharpen it |
| 2 | Active gameplay | Two Ways phone (replaces repeated home screen) |
| 3 | Tournament screen | Competition section |
| 4 | How to Play | How to Play section (replaces the home-screen crop) |
| 5 | Winner / result state | Competition winners |
| 6 | Player / community / social screen — only if one genuinely exists | Two Ways |

Requirements: device screenshot at native resolution (≥1080 px wide), PNG,
no mock-up, no frame, no WhatsApp compression. Use a demo account or blank out
personal data (names, avatars, balances) before sending.

## 5. Official logo / wordmark

Format: **SVG** (preferred) or transparent PNG ≥2000 px wide. Never recreated in a font.
It replaces the temporary mark in one place — `src/content/brand.ts` — which feeds:

- Navbar (top-left), mobile menu header, footer (`components/site/Logo.tsx`)
- Favicon and Apple touch icon (`public/favicon.png`, `public/apple-touch-icon.png`) — regenerate from the official mark
- Organization structured data `logo` (add once supplied)

## 6. Social preview image (Open Graph)

1200×630 PNG/JPG, approved artwork, key content inside the central 1000×520.
Drop in `public/`, set `site.ogImage` in `src/content/site.ts`; large-card
previews switch on automatically. Until then previews are text-only (honest).

## 7. Higher-resolution product photography

Safari Edition box and Expansion Pack: ≥1600 px on the long edge, transparent
or pure-white background. Current files are 600 px: sharp on standard screens,
slightly soft on 2× screens, and too small for a detail crop (slot `boxDetail`).
