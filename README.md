# Albastini Website

The official website for **Albastini**, the Tanzanian card game you can play two ways:
with the physical cards around a table, or on the Albastini app.

**INGIA UWANJANI TUCHEZE.**

## Status: Final handoff complete — ready to deploy on Vercel

- Phase 1 (`docs/PHASE-1.md`): truthful, safe, stable foundation.
- Phase 2 (`docs/PHASE-2.md`): visual system, motion, hero and chapter redesign.
- Phase 3 (`docs/PHASE-3.md`): art-direction refinement, asset slots, provenance.
- Phase 4 (`docs/PHASE-4.md`): real David portrait, real table and card-front photography.
- Phase 5 (`docs/PHASE-5.md`): launch QA.
- Final handoff (`docs/FINAL-HANDOFF.md`): verified #26 champions, #27 on 12 Dec, champions carousel, official brand mark, Vercel.

Hand-offs: `docs/ASSET-SPECS.md`, `docs/CTA-AUDIT.md`, `docs/LANGUAGE-REVIEW.md`,
`assets-source/README.md`.

Genuine source originals live untouched in `assets-source/` (not bundled), with
derivative steps documented next to them.

Ground rules for anyone editing this repo:

- **Never invent data.** No placeholder winners, stats, prices, dates or product specs.
  If something isn't verified, leave it out; the UI has neutral empty states.
- **One theme.** No light/dark mode. Colours come only from the logo: blue, yellow,
  red, green, black, white (and tints of them).
- **Official assets only.** Don't redraw, regenerate or "improve" the logo, cards,
  packaging or app screenshots.
- **Lovable sync.** This repo syncs with Lovable. Don't force-push or rewrite pushed
  history (see `AGENTS.md`).

## Stack

React 19 + TypeScript, TanStack Start (SSR) + TanStack Router, Vite, Tailwind v4.
Deployed on Vercel.

```bash
npm ci
npm run dev      # local dev server
npm run build    # production build (set VITE_SITE_URL=https://… once the domain is verified)
npx tsc --noEmit # type-check
npm run lint
```

## Where things live

```text
src/
├── content/              the only place public data lives (version-controlled)
│   ├── tournaments.ts    tournaments: typed, verified fields only
│   ├── winners.ts        verified winners only (image optional)
│   ├── links.ts          app store links (NEED VERIFICATION)
│   ├── brand.ts          brand mark; swap in the official logo here
│   ├── assets.ts         image registry with provenance (swap scans here)
│   └── navigation.ts     section anchors
├── lib/
│   ├── tournament.ts     phase (upcoming/live/ended), countdown, Tanzania-time formatting
│   └── i18n.tsx          all English + Kiswahili copy
├── components/site/      page sections and shared CTAs
│   ├── DownloadButton    APP CTA family (yellow, opens the store dialog)
│   └── CardsButton       PHYSICAL CARD CTA family (outline, goes to #cards)
└── routes/index.tsx      the homepage
archive/admin-prototype/  the disabled admin panel, kept for reference only
```

## Images

Sources live in `src/assets/`. After replacing or adding one, run
`node scripts/optimize-images.mjs` to regenerate the AVIF/WebP variants.

## Updating tournaments and winners

Edit `src/content/tournaments.ts` or `src/content/winners.ts` and redeploy.

- Use full ISO times with the Tanzania offset, e.g. `2026-11-21T20:00:00+03:00`.
- Leave `startAt` out until the start time is confirmed. The site then shows the date
  with "details coming soon", and never a countdown or a "live" state.
- Set `status: "completed"` once an event is over. Even if you forget, an event stops
  being shown as upcoming/live after its calendar day ends in Tanzania.
- Winners without a photo render as text-only cards. Never add a placeholder portrait.

## Deploying on Vercel

1. Import the GitHub repo in Vercel. `vercel.json` pins `npm ci` + `npm run build`
   (the repo also contains `bun.lock`; the tested path is npm).
2. No framework preset needed: the build emits Vercel Build Output API v3
   (`.vercel/output`, Node 22 server function + static assets).
3. After the first production deploy, set **`VITE_SITE_URL`** (Production) to the real
   public URL (e.g. `https://<project>.vercel.app`, or a custom domain later) and
   redeploy. That enables canonical, `og:url`, `sitemap.xml` and Organization/WebSite
   JSON-LD. Never guess it. See `.env.example`.
4. Preview deployments are not indexed by Vercel by default; canonical/sitemap only
   ever point at `VITE_SITE_URL`.

## Routine content updates (no UI code changes)

| Change | File |
|---|---|
| Next tournament (number, date, start time, status, registration) | `src/content/tournaments.ts` |
| Winners (display name, placement, location, photo, fit/position) | `src/content/winners.ts` |
| Prize structure (1st/2nd/3rd, TSH) | `tournamentPrizeStructure` in `src/content/winners.ts` |
| Store links | `src/content/links.ts` |
| Brand mark / images | `src/content/assets.ts` + `scripts/optimize-images.mjs` |
| Site copy (EN/SW) | `src/lib/i18n.tsx` |
