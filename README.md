# Albastini Website

The official website for **Albastini**, the Tanzanian card game you can play two ways:
with the physical cards around a table, or on the Albastini app.

**INGIA UWANJANI. TUCHEZE.**

## Status: Phase 1 complete (stabilization)

Phase 1 made the existing site truthful, safe and ready for the CEO-approved redesign.
See `docs/PHASE-1.md` for the change log and the content waiting on the Albastini team.

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
npm run build    # production build
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

## Updating tournaments and winners

Edit `src/content/tournaments.ts` or `src/content/winners.ts` and redeploy.

- Use full ISO times with the Tanzania offset, e.g. `2026-11-21T20:00:00+03:00`.
- Leave `startAt` out until the start time is confirmed. The site then shows the date
  with "details coming soon", and never a countdown or a "live" state.
- Set `status: "completed"` once an event is over. Even if you forget, an event stops
  being shown as upcoming/live after its calendar day ends in Tanzania.
- Winners without a photo render as text-only cards. Never add a placeholder portrait.
