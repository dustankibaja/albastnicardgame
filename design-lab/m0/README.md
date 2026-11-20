# M0 design boards

Self-contained review page for the award-level revamp (branch `feature/award-revamp`).
**Boards only: no scene code.**

- `index.html` — the boards (open directly in a browser; real assets embedded, 1.8 MB).
- `build.py` — generates `index.html`. `M0_ASSETS=<dir> python3 design-lab/m0/build.py`.
  Assets are web-weight derivatives built from the originals in `assets-source/` (see `docs/ASSET-SPECS.md`).
- `../../scripts/normalize-cards.mjs` — D3: fits all nine official cards onto one 1024x1536 canvas
  (contain, 0% crop). Report: `assets-source/official-cards/normalized/normalization-report.json`.

Gate (owner): *could these boards belong to any other brand?* Board 13 carries my own honest read.
