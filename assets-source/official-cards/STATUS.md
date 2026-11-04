# Status: OFFICIAL (current production)

The Albastini project owner has approved these individual card assets as the
**official Albastini cards for current use, until further notice**. This
supersedes the earlier "temporary / reconstructed reference" status.

- 8 fronts (`Fronts/`) and 1 back (`Back/`), 1024×1536, transparent corners.
- Used on the site: red, black and blue aces (hero hand + Two Ways card hand),
  via `src/assets/cards/ace-*.png` → registry ids `aceRed`, `aceBlack`, `aceBlue`.
- Available for future use: green, purple, teal, orange and giraffe aces; the back.
- Card flips are not implemented (design freeze); the back is ready if the team
  ever asks for them.

Internal provenance note: these were reconstructed earlier in the project from
limited card photography and then approved by the owner. If straight-on scans are
ever produced, replace the files and regenerate derivatives; no UI changes needed.
Filenames still carry the original `_TEMP` suffix from the supplied pack; that
suffix is historical, not a status.

Derivatives in `src/assets/cards/ace-*.png` are the supplied fronts cropped to the
card edge (transparent padding removed; artwork untouched) so shadows and the
card-hand selection ring follow the actual card.
