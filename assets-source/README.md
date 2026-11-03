# Asset provenance index

Every image the site can show. Generated from `src/content/assets.ts` (registry),
`scripts/optimize-images.mjs` (derivative jobs) and the code that uses each id.

- **Originals** for Phase 4 genuine photos: `phase4/` here (untouched; SHA-256 in `phase4/MANIFEST.csv`; transformations in `phase4/DERIVATIVES.md`).
- **Nothing in `assets-source/` is bundled.** Only AVIF/WebP derivatives from `src/assets/optimized/` ship (verified in the Phase 5 build scan).
- Statuses are never promoted silently. `temporary_reference` = provenance unconfirmed.

| Registry id | Status | Derivative source (`src/assets/`) | SHA-256 (source) | Used in | Notes |
|---|---|---|---|---|---|
| `aceRed` | temporary_reference | `card-red-official.webp` | e0bf7ffb98a4b363… | TwoWaysSection, Hero | Isolated red ace (partial face crop). Paper texture suggests a photo crop, but whether it is a genuine scan or a reconstruction is unconfirmed. Replace with an official scan. |
| `aceBlack` | temporary_reference | `card-black-official-v2.webp` | 21f5e44735fa14d2… | TwoWaysSection, Hero | Isolated black ace cut-out (partial face). Clean cut-out; possibly reconstructed. Unconfirmed. Replace with an official scan. |
| `aceBlue` | temporary_reference | `card-blue-official.webp` | d38f613bb07209df… | TwoWaysSection, Hero | Isolated blue ace (partial face crop). Unconfirmed provenance. Replace with an official scan. |
| `cardFan` | official | `card-fan.webp` | 9acec48da64dcc3a… | FinalCTA | Card fan + crown mark; the same artwork appears in the official app's home screen logo. |
| `boxSafari` | real_source_photo | `box-safari-retail.webp` | 07f337f40296f8b6… | PhysicalCardsSection | Safari Edition retail box, real product photography (onboarding brief §8). |
| `boxDetail` | awaiting | — | — | slot (renders nothing) | Detail crop of the product. Needs a high-resolution product photo: the current 600px box photo goes soft when magnified. |
| `boxExpansion` | real_source_photo | `box-expansion.webp` | 2a76a44f284862f2… | PhysicalCardsSection | Safari Edition Expansion Pack box, real product photography. |
| `appHome` | real_source_photo | `app-home-public.webp` | 3f162563f8479b4b… | HowToPlaySection, PhoneMockup | Genuine app home screenshot, cropped below the personal profile bar. |
| `davidSanyaPortrait` | real_source_photo | `photos/david-sanya-portrait.png` | 2d112ea2c274e32e… | winners | Genuine photograph of David Sanya (project owner, Phase 4). Derivative: crop, alpha-matte background separation, uniform gamma lift. No regeneration. See assets-source/phase4/DERIVATIVES.md. |
| `cardsOnTable` | real_source_photo | `photos/cards-on-table.jpg` | a29443b986b08043… | TwoWaysSection | Genuine photo of Albastini cards fanned on a wooden table (shows card backs). Crop only. Not an official scan. |
| `cardFrontsOnWhite` | real_source_photo | `photos/card-fronts-on-white.png` | acffd07807885781… | PhysicalCardsSection | Genuine product photo of nine card fronts on white, shot at an angle. Crop only. Not official isolated scans; never extract/reconstruct cards from it. |
| `communityPlay` | awaiting | — | — | slot (renders nothing) | Cleared (approved_public) community photo of real play. None cleared yet. |

Other shipped images: `src/assets/albastini-logo.webp` (official card-fan mark, navbar/footer via `content/brand.ts`), `public/favicon.png` (same mark), `public/apple-touch-icon.png` (Phase 5 derivative: mark at 150 px on white, 180×180).
