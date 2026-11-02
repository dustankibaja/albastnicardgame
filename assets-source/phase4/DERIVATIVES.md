# Phase 4 derivatives

Originals in this folder are untouched (SHA-256 in MANIFEST.csv). They are
NOT bundled. Derivatives in `src/assets/photos/` are made from them as below.
Provenance for all three: `real_source_photo` (not official scans, not
AI references).

| Derivative | Operations | Source |
|---|---|---|
| `david-sanya-portrait.png` (720×880, alpha) | crop `(400,360)–(1120,1240)` of the original (crop B of three tested: wide / medium / tight — medium keeps the face recognisable at natural proportions without magnifying beyond source quality); background separated with an alpha matte from the `isnet-general-use` segmentation model (largest region kept, stray desk fragments dropped); uniform gamma 0.88 to lift the backlit face. No pixels of the person are generated, moved or retouched. | `winner/david_sanya_original.jpg` |
| `cards-on-table.jpg` (2048×900) | crop to the band `(0,380)–(2048,1280)`: the fanned deck and wood; excludes the person's forearm and a phone at the top. Used as a strip, so only this band is ever shown. | `cards/albastini_cards_on_wooden_table_original.jpg` |
| `card-fronts-on-white.png` (1750×1560) | crop to the cards and their shadows on native pure-white ground. | `cards/albastini_card_fronts_on_white_original.png` |

Rejected: `u2net_human_seg` matte (punched holes through the shirt).

Note: the table photo shows the genuine card BACK design. It is angled and
partially covered, so it is not a usable back asset; flips remain off.
The URL printed on the backs is not used as a site link (unverified).
