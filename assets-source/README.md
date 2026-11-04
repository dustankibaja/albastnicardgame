# Asset provenance index

Every image the site can show. Generated from `src/content/assets.ts` (registry), `scripts/optimize-images.mjs`
(derivative jobs) and the code that uses each id. **Nothing in `assets-source/` is bundled** (verified in the
production scan); only AVIF/WebP derivatives of registered images ship.

| Registry id | Status | Derivative source (`src/assets/`) | SHA-256 (source) | Used in | Notes |
|---|---|---|---|---|---|
| `aceRed` | official | `cards/ace-red.png` | b62982b5541e4a7c… | Hero, TwoWaysSection | Official Albastini red ace (owner-approved current production card, full face, 1024×1536). See assets-source/official-cards/STATUS.md. |
| `aceBlack` | official | `cards/ace-black.png` | b06e7c2ac3cb483d… | Hero, TwoWaysSection | Official Albastini black ace (owner-approved current production card, full face, 1024×1536). See assets-source/official-cards/STATUS.md. |
| `aceBlue` | official | `cards/ace-blue.png` | aac4144bb891e4d4… | Hero, TwoWaysSection | Official Albastini blue ace (owner-approved current production card, full face, 1024×1536). See assets-source/official-cards/STATUS.md. |
| `cardFan` | official | `brand/albastini-mark-official.png` | 33399a0010050bf3… | FinalCTA | Official Albastini brand mark source (2048 px, final handoff). Card fan + crown. |
| `brandMark` | official | `brand/albastini-mark-official.png` | 33399a0010050bf3… | brand | Official Albastini brand mark source (final handoff); navbar, menu and footer mark. |
| `bedadiPortrait` | real_source_photo | `photos/bedadi-portrait.jpg` | a5eadeffbe904ada… | winners | Genuine photo of Bedadi (Tournament #26, 2nd). Used whole; framed by CSS (cover). No edits. |
| `mjeshiPortrait` | real_source_photo | `photos/mjeshi-portrait.png` | 1948340d3dcb8981… | winners | Genuine photo of MJeshi (Tournament #26, 3rd), separated from the official poster (the only source supplied) with an alpha matte; poster text/graphics excluded. No regeneration. |
| `boxSafari` | real_source_photo | `box-safari-retail.webp` | 07f337f40296f8b6… | PhysicalCardsSection | Safari Edition retail box, real product photography (onboarding brief §8). |
| `boxDetail` | awaiting | — | — | slot (renders nothing) | Detail crop of the product. Needs a high-resolution product photo: the current 600px box photo goes soft when magnified. |
| `boxExpansion` | real_source_photo | `box-expansion.webp` | 2a76a44f284862f2… | PhysicalCardsSection | Safari Edition Expansion Pack box, real product photography. |
| `appHome` | real_source_photo | `app-home-public.webp` | 3f162563f8479b4b… | HowToPlaySection, PhoneMockup | Genuine app home screenshot, cropped below the personal profile bar. |
| `davidSanyaPortrait` | real_source_photo | `photos/david-sanya-portrait.png` | 2d112ea2c274e32e… | winners | Genuine photograph of David Sanya (project owner, Phase 4). Derivative: crop, alpha-matte background separation, uniform gamma lift. No regeneration. See assets-source/phase4/DERIVATIVES.md. |
| `cardsOnTable` | real_source_photo | `photos/cards-on-table.jpg` | a29443b986b08043… | TwoWaysSection | Genuine photo of Albastini cards fanned on a wooden table (shows card backs). Crop only. Not an official scan. |
| `cardFrontsOnWhite` | real_source_photo | `photos/card-fronts-on-white.png` | acffd07807885781… | PhysicalCardsSection | Genuine product photo of nine card fronts on white, shot at an angle. Crop only. Not official isolated scans; never extract/reconstruct cards from it. |
| `communityPlay` | awaiting | — | — | slot (renders nothing) | Cleared (approved_public) community photo of real play. None cleared yet. |

## Source packs (originals, untouched, not bundled)

| Folder | Contents | Status |
|---|---|---|
| `phase4/` | David Sanya photo, cards on wooden table, card fronts on white (SHA-256 in `MANIFEST.csv`; steps in `DERIVATIVES.md`) | real_source_photo |
| `final-handoff/` | Official brand mark; Bedadi and David originals; three official Tournament #26 posters; #27 app screen and promo (SHA-256 in `MANIFEST.csv`, verified) | official / real_source_photo / reference |
| `official-cards/` | 8 card fronts + 1 back, approved by the owner as the **official cards for current production** (see `STATUS.md`) | official — red/black/blue aces in use |

## Notes

- **Cards:** the owner promoted the individual card pack to official (current production, until further notice). Internal history: reconstructed earlier in the project from limited card photography, then approved. Derivatives are cropped to the card edge only.
- **Poster filenames are swapped:** `tournament_26_1st_david_sanya_official_poster.png` shows *3rd, MJESHI, 26,000 TSH*; `tournament_26_3rd_jeshi_official_poster.png` shows *1st, SANYA, 130,000 TSH*. Content (not filenames) was used.
- **MJeshi portrait:** separated (alpha matte, `isnet-general-use`) from the poster that shows him — the only source supplied; poster text, skyline and lettering excluded; bottom 40 px trimmed (poster light bleed). No regeneration. Display name **MJeshi** confirmed by the owner.
- **Bedadi portrait:** original photo used whole; framing by CSS only. **David portrait:** Phase 4 derivative reused.
- **Official brand mark:** same artwork as the previous mark (mean difference < 2/255), from the 2048 px source; also generates favicon and touch icon.
- **Reference only, never shown:** the #27 app screen and promo (they show the postponed 31 Oct date and its 8:00 PM start).
