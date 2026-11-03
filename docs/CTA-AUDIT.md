# CTA audit

Generated from the running site (desktop 1440 + mobile 375, EN + SW).

Families: **APP** = yellow, opens the single store dialog · **CARDS** = outline, scrolls to `#cards`.
No CTA goes nowhere, simulates success, or implies purchase.

| Section | EN label | SW label | Destination | Verified | Family | Desktop | Mobile |
|---|---|---|---|---|---|---|---|
| header | Play | Cheza | #play | ✅ in-page anchor | nav link | ✅ | in menu |
| header | How to play | Jinsi ya kucheza | #how-to-play | ✅ in-page anchor | nav link | ✅ | in menu |
| header | Tournaments | Mashindano | #tournaments | ✅ in-page anchor | nav link | ✅ | in menu |
| header | Physical cards | Karata halisi | #cards | ✅ in-page anchor | nav link | ✅ | in menu |
| header | Download the app / Get the app (responsive) | Pakua app | opens store dialog | ⚠ Store links unverified (`src/content/links.ts`) | APP (yellow) | ✅ | ✅ |
| top | Download the app | Pakua app | opens store dialog | ⚠ Store links unverified (`src/content/links.ts`) | APP (yellow) | ✅ | ✅ |
| top | Card availability | Upatikanaji wa karata | #cards | ✅ in-page anchor | CARDS (outline) | ✅ | ✅ |
| play | Card availability | Upatikanaji wa karata | #cards | ✅ in-page anchor | CARDS (outline) | ✅ | ✅ |
| how-to-play | Download the app | Pakua app | opens store dialog | ⚠ Store links unverified (`src/content/links.ts`) | APP (yellow) | ✅ | ✅ |
| tournaments | Play on the app | Cheza kwenye app | opens store dialog | ⚠ Store links unverified (`src/content/links.ts`) | APP (yellow) | ✅ | ✅ |
| cards | Get card updates | Pata taarifa za karata | expands closed form | ✅ honest closed state | disclosure | ✅ | ✅ |
| cards | Notify me | Nitaarifu | submit (disabled) | ✅ honest closed state | CARDS (outline) | ✅ | ✅ |
| final-title | Download the app | Pakua app | opens store dialog | ⚠ Store links unverified (`src/content/links.ts`) | APP (yellow) | ✅ | ✅ |
| final-title | Card availability | Upatikanaji wa karata | #cards | ✅ in-page anchor | CARDS (outline) | ✅ | ✅ |
| footer | Play | Cheza | #play | ✅ in-page anchor | nav link | ✅ | ✅ |
| footer | How to play | Jinsi ya kucheza | #how-to-play | ✅ in-page anchor | nav link | ✅ | ✅ |
| footer | Tournaments | Mashindano | #tournaments | ✅ in-page anchor | nav link | ✅ | ✅ |
| footer | Physical cards | Karata halisi | #cards | ✅ in-page anchor | nav link | ✅ | ✅ |

## Notes

- "Play on the app" (tournament) and "Download the app" open the same dialog; the label is deliberately contextual. Same family and styling. Change `cta.playApp` if one label is preferred.
- When an official tournament registration link exists, set `registrationUrl` in `src/content/tournaments.ts`; the tournament CTA then links there instead (verified by test).
- If a store link is withdrawn (`url: null`), the dialog shows only the remaining store, or an honest "coming soon" note (verified by test).
- "Notify me" stays disabled inside a clearly closed form until a backend, consent wording and notification channel are approved.
