# Phase 3: Art-direction and editorial refinement

Status: built, awaiting design review. Phase 4 not started.

## What changed
- **Hero:** the three aces form a held hand (heavy overlap, rotations −19°/−7°/6°,
  three depths via scale/shadow/parallax speed). The phone is ~equal in weight
  to the hand and overlaps the front card: one stage, two experiences.
- **Two Ways:** one sentence, "From the table. To the screen.", set as a single
  headline. Hand + copy side by side; a full-width card-wave band closes the
  chapter and the phone rises out of it as a partial device.
  Height −31% desktop, −29% mobile (1200→824px, 1379→983px).
- **Type pacing:** volume tokens `type-poster` (hero, Competition, final),
  `type-headline` (Two Ways, How to Play, Physical), `type-editorial`
  (sub-headings), `type-lede` (Instrument Sans carrying quiet moments).
- **App screenshot, three distinct treatments:** full phone (hero), partial
  device rising from the band (Two Ways), tight interface crop on the real
  How to Play control (How to Play).
- **Winner system:** portraits come from the asset registry; with a genuine
  photo, the portrait stands in front of the rank numeral and fades into
  the arena (CSS mask, no background removal needed). Layout verified with a
  non-person stand-in, then reverted. Without a photo: typographic record.
- **Physical chapter:** Safari Edition box dominates and crosses the arena edge;
  expansion pack supports; form folded away below the product story.
  Slots for the table photo and a detail crop render only when filled.
- **Final CTA:** the card fan enters from beyond the page (crosses the top
  edge, cut by the right edge, rotates into place on scroll).
- **Humanity hooks:** `communityPlay` / `cardsOnTable` slots appear in Two Ways
  and Physical when cleared photos are registered. No new "Community" chapter.

## Asset provenance (src/content/assets.ts)
| id | status | note |
|---|---|---|
| aceRed / aceBlack / aceBlue | temporary_reference | isolated card files; genuine vs reconstructed unconfirmed (downgraded this phase, per "never silently promote") |
| cardFan | official | same artwork as the app's home-screen logo |
| boxSafari, boxExpansion | real_source_photo | product photography |
| appHome | real_source_photo | genuine screenshot, cropped below profile bar |
| davidSanyaPortrait | awaiting | not received in this session |
| cardsOnTable, cardFrontsOnWhite | awaiting | not received in this session |
| boxDetail | awaiting | needs a high-res product photo (600px source goes soft) |
| communityPlay | awaiting | no cleared photography yet |

## Blocked on assets
1. David Sanya photograph (genuine, from the project owner).
2. Cards on the wooden table; card fronts on white.
3. High-resolution product photo (for the detail crop and larger product scale).
4. Higher-resolution / additional app screenshots (How to Play crop is capped at 340px).
5. Official card scans (to replace the temporary-reference aces).
6. Cleared community photography.
7. Official wordmark file.
