# Phase 2: Visual system, experience architecture and hero rebuild

Status: built, awaiting design review. Phase 3 not started.

## Design system
- Type: Archivo (wdth 62–100, wght 600–900) for display, Instrument Sans
  (400–700) for text. Self-hosted in `public/fonts/`, subset to Latin +
  typographic punctuation (61 KB total). Licences: SIL OFL 1.1, included.
- Colour: the six logo colours only. `--alba-night` is brand blue shaded with
  black (arena depth), not a new hue.
- Motion tokens: `--dur-fast` 150ms, `--dur-std` 260ms, `--dur-enter` 650ms,
  `--ease-out`, `--ease-std`. Transform/opacity only.
- Motif: the wave band from the card faces (`Wave.tsx`). No dots, grids,
  triangles or blobs.
- CTA families: `DownloadButton` (yellow, app) and `CardsButton` (outline,
  physical cards). No other button styles on the page.

## Motion
- Hero page-load entrance (type → buttons → cards → phone, done by ~0.6s).
- Scroll depth: one shared listener (`hooks/use-depth.ts`), active only while
  elements are on screen, writes one CSS variable.
- Pointer depth on the hero: hover-capable fine pointers only, eased, stops
  when settled.
- Reduced motion: no entrance, no depth, no reveal; everything visible.
- No animation library, no scroll-jacking, no pinned sections, no loops.

## Assets
All images go through `src/content/assets.ts` (provenance per image) and
`scripts/optimize-images.mjs` (AVIF + WebP at 1×/2×, never upscaled).
To swap in official scans: replace the file in `src/assets/`, run
`node scripts/optimize-images.mjs`, nothing else.

Not received this phase: the new isolated card references mentioned in the
brief (some AI-reconstructed). None are used.

## Known limits / open for review
- No people: no cleared community photography yet.
- Card images are ~500px partial crops: cards can't be shown larger.
- No official wordmark: the mark appears alone.
- One app screenshot is reused three times.
- David Sanya has no portrait: the winner system shows a typographic record;
  a real cut-out portrait slots in via `image` in `content/winners.ts`.
- New Kiswahili copy needs a native review.
