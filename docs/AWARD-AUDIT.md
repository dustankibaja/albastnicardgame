# Albastini — Award-Level Design Audit & Implementation Plan

Status: **audit only. No scene code written.** Baseline audited: commit `c02f4e2` (the live preview).
Everything marked *measured* was measured on the running site; everything marked *estimate* is judgement.

---

## 0. Verdict

The current site is honest, accessible, fast and well built. It is **not yet distinctive**.
It is a good *system* (tokens, type, content model, a11y) wrapped around a *template-shaped experience*:

- **one header behaviour**, **one button shape**, **one reveal** (fade + 28px rise), **one parallax idea** (vertical drift), **one section transition** (the wave).
- The brand's rarest material — card edge, 11 POINTS chip, card back, card fan, crown token — appears as **content** (pictures of things), not as **interface grammar** (how things behave).

That is the whole revamp in one line: **turn the product into the interface.**
Test from the brief ("could this belong to another brand unchanged?"): today, only the cards themselves fail that test. Header, buttons, carousel, tournament panel, reveals and footer would all work on any dark-blue gaming site.

Honest limit: I can commit to craft, process and measurable quality. I can't promise a jury result; originality and execution are judged by people.

---

## 1. Evidence base (measured)

| Fact | Value |
|---|---|
| Page length | 6,032 px = 6.7 viewports (desktop 1440×900); 6,454 px = 7.9 viewports (mobile 375×812) |
| Scene share of scroll (desktop) | Hero 13% · Table/Screen 14% · How to Play 12% · **Competition+Champions 33%** · Physical 13% · Finale 15% |
| Scene share (mobile) | 14% · 16% · 12% · **30%** · 16% · 13% |
| Hero height | 763 px on a 900 px screen: the next scene is visible at first paint |
| Header states | **2.** Transparent-blue at the top, then a **solid white bar for the remaining ~85% of the page**, including the dark arena and the finale (see `awards-evidence/nav-states.png`) |
| Entrance/reveal vocabulary | 1 entrance keyframe; **8** identical `Reveal` wrappers; **8** parallax objects, all the same vertical-drift grammar |
| Easing | 2 tokens (`ease-out`, `ease-std`). No 3D, no custom cursor, no canvas anywhere |
| Shape language | **24** surfaces use `rounded-full` (buttons, toggle, carousel, menu, chips); only 10 bespoke radii |
| Card pack geometry | Fronts h/w 1.365–1.414, **back 1.45**; card widths differ **12.5%** on the same canvas (see §6) |
| Browser support, scroll-driven CSS | Chrome/Edge 115+, Safari 26+, **Firefox 159 shipped Oct 2026** (one month ago) → needs a fallback for older Firefox |
| Bundle | JS ≈ 108 KB + 26 KB gz · CSS ≈ 9 KB gz · fonts 61 KB |

Limits of this audit: stills and a half-viewport density scan can't judge motion *feel*. My first density threshold flagged every frame (large flat fields are deliberate), so I discarded it as an absolute test and used it only to rank frames. Real-browser, real-device motion review by the owner remains essential.

---

## 2. From "Living Table" to a visual grammar

Derived only from real Albastini material:

| Form | Source in the product | Becomes |
|---|---|---|
| **The Edge** | Card silhouette: ~7–8% corner radius, paper edge | Radius + 1px paper keyline for buttons, frames, nav object, form fields. Replaces the pill |
| **The Wave** | Curve across every card face | Escalate from divider to *structure*: scene edges that change scale/depth, masks, nameplate cuts, prize-ladder base |
| **The Chip** | 11 POINTS yellow circle | Active-section marker, step markers (01/02), rank markers, cursor token, form checkmark |
| **The Fan** | Hand formations | Hero deal, card hand, product spread, finale |
| **The Back** | Approved official back | The flip reveal. (Not a pattern wallpaper.) |
| **The Crown** | Crown token | First place marker; finale anchor |

**Motion language: four verbs, not one** (all transform/opacity, none looping):

| Verb | Used for | Feel | Duration |
|---|---|---|---|
| **DEAL** | Cards entering | Arcing entry, one settle, no overshoot | 480–620 ms, 70–90 ms stagger |
| **TURN** | Card flip | 3D rotateY, weighty ease | 520 ms |
| **SLIDE** | Nav marker, carousel, ladder bars | Linear-ish, directional | 280–340 ms |
| **SETTLE** | Text/secondary reveals | Small, quiet | 420–520 ms |
| micro | hover/press | immediate | 120–180 ms |

Rule: **each scene owns exactly one hero motion**; everything else in that scene is SETTLE or static.

---

## 3. Global systems audit

### 3.1 Navigation
| | |
|---|---|
| Works | Keyboard order, focus trap + Escape in the mobile overlay, language semantics, download always reachable |
| Generic | 2-state header; white bar over dark scenes; 4 links + underline hover; no sense of place |
| Keep | All a11y behaviour; mark-only logo (no wordmark exists) |
| Change | A **compact docked "card-edge" bar**. Transparent in the hero; collapses on scroll to a short bar (mark · current-scene label · language · Download). **Theme per scene** (blue / paper / night) via `data-theme` on scenes and an IntersectionObserver, 200 ms cross-fade. **Active-section marker = a yellow 11-point chip that slides between links** (SLIDE). Mobile: compact bar, overlay keeps its art direction |
| Complexity / Perf / A11y | M / low / **medium** — AA contrast must be proven in all three themes (axe at each scroll state); focus ring colour per theme |

### 3.2 Buttons, controls, form
| | |
|---|---|
| Works | Two families, consistent, ≥44 px, honest labels ("Download the app" vs "Play on the app") |
| Generic | Pill everywhere (24 surfaces) — the single most template-like trait |
| Change | **Card-edge button:** ~10–12 px radius, 1.5 px inset keyline, directional chip-arrow. Hover: inner fill sweep (scaleX, 220 ms) + label 3 px + arrow 4 px; press: 1 px down, shadow shrinks; focus: 3 px offset ring. APP = yellow field; CARDS = keyline outline; same geometry. Language toggle, carousel controls and nav button adopt the same family (rounded-square, not pill) |
| Form (closed) | Custom labels, keyline fields, chip checkmark for consent, designed error state; success state exists only once a backend does (still no fake success) |
| Complexity / Perf / A11y | S–M / negligible / low (contrast of yellow field vs focus ring checked per theme) |

### 3.3 Selective cursor token
- **Only** over zones where a click does something: the Table card hand and the product cards. **Not** the hero (hero cards have no action; a "VIEW" label that does nothing is a lie).
- Fine pointers only (`hover:hover` + `pointer:fine`); one fixed element, transform only, one rAF loop that idles when still; native cursor everywhere else, never hidden over text.
- Keyboard/touch equivalent: the label appears as a chip on the focused/selected card ("FLIP", "SELECT").
- Complexity M / perf low-med / a11y low (decorative; information is also on the element).

### 3.4 Typography — compositional, same families
Existing Archivo (wdth 62–100, wght 600–900) + Instrument Sans (400–700) can deliver the range **without new fonts**; the width axis is the unused instrument.

| Role | Treatment |
|---|---|
| Poster (hero, competition, finale) | Archivo wdth 62 / wght 900, leading 0.8, per-headline optical kerning pairs |
| Editorial (table/screen, product) | wdth ~72–80 / 800, one outlined or yellow word per headline |
| Quiet (how to play, support) | Instrument Sans 500, larger measure, no caps |
| Meta (tournament no., placement, date, mode, location) | Archivo wdth 100 / 700, small caps feel, **tabular numerals** |
| Numerals (prizes, dates, #27, ranks) | Own treatment; verify `tnum` exists in the Archivo subset at build time, else set numerals in Instrument Sans |

Not planned: italics (Archivo italic isn't shipped; ~+30 KB; add only if a specific headline needs it). A full wrap/orphan audit stays (the current line-break map exists); extend it to every new composition at 320–2560.

### 3.5 Section transitions — choose four
| # | Transition | Idea | Risk |
|---|---|---|---|
| T1 | Hero → Table | Settled cards cast a shadow *onto the wooden table* and the lowest card overlaps the boundary (z-crossing) | low |
| T2 | Table → Screen | **The signature** (§4.2) | high |
| T3 | How to Play → Arena | Phone exits, light drops: the card-wave **scales** into the arena's top edge while blue deepens | low |
| T4 | Physical → Finale | Same blue ace appears at the boundary on white and again on black (match-cut) | low |

### 3.6 The traveling object — recommendation
Use a **match-cut, not a literal traveling element**: the **blue ace** (blue = dominant brand colour) recurs at matching position/scale/rotation across adjacent scenes (hero → hand → product fan → finale).
Why: a true persistent layer fights `overflow` clipping, z-index and mobile performance for ~10% extra effect. A desktop-only persistent layer remains an optional upgrade after M9 if budgets allow.

### 3.7 Performance & accessibility contract (enforced by scripts, not intent)
- **No new runtime library. No WebGL** (nothing in the concept needs it).
- Budgets: JS ≤ +10 KB gz · CSS ≤ +6 KB gz · new image derivatives ≤ +180 KB, lazy · LCP element stays the H1 text · CLS 0 · no long task > 50 ms during scroll at 4× CPU throttle · ≤ 2 active rAF loops (hero pointer, cursor), both idle at rest.
- Animate `transform`/`opacity` only (ladder bars = `scaleX`). No animated masks/filters/clip-path on large images.
- Scroll choreography: **native scroll-driven CSS** inside `@supports (animation-timeline: view())`, with the existing `--p` rAF variable as fallback for older Firefox; content is always visible without either.
- Every bespoke interaction ships with: keyboard equivalent · visible focus · touch equivalent · reduced-motion equivalent · semantics (table in §7).

---

## 4. Scene-by-scene audit

### 4.1 Hero — opening scene
| | |
|---|---|
| Works | Both experiences visible in the first viewport at every width (verified); CTAs above the fold; official cards; reduced-motion static; H1 is the LCP so nothing waits |
| Generic | Hand + phone on a flat blue field; every object enters with the *same* fade-up; phone and cards share one motion; the hero is shorter than the screen so the next scene intrudes at load |
| Keep | Copy, hierarchy, CTA pair, 01/02 captions, instant legibility |
| Change | **DEAL entrance:** three aces arc in from lower-right and settle (stagger 80 ms, ≈520 ms each); the phone rises from *behind* the hand and crosses the front card's edge; final composition = today's. Total ≤ ~900 ms; headline and CTAs visible at 0 ms. **Grounding:** a faint table-edge plane/shadow under the hand so objects sit *somewhere*. **Pointer depth:** three card rates + separate phone rate; hovered card lifts 6–8 px, neighbours shift fractionally (decorative; hero cards stay non-interactive, no extra tab stops). Hero height → full `100svh` composition (decision D5) |
| Complexity / Perf / A11y | M / low–med (4 transformed layers; must re-measure INP) / low (reduced-motion → final state, no entrance) |

### 4.2 Table → Screen — the signature moment
| | |
|---|---|
| Works | Idea, real table photo as evidence, compressed height, whole-phrase breaks, keyboard-operable hand |
| Generic | Three stacked parts (photo strip, hand panel, phone-on-blue-band). "TO THE SCREEN." is just a colour change; nothing *transforms* |
| Keep | Real photo, protected phrases, the Play/Friendship/Competition hand, small height ethic |
| Change | **A short native-sticky scene (not scroll-jacking).** A: the fan occupies the table, "FROM THE TABLE." leads. B (scroll-linked): the fan **squares up into a deck**, its edges align, and the phone **slides out from behind the deck** as the screenshot area opens along the card-wave; "FROM THE TABLE." dims while "TO THE SCREEN." resolves in yellow |
| Design caveat | A *literal* card→phone morph distorts (card 1.4 : phone ~1.8). Recommendation: **deck → hand-off choreography** (no morph; the deck remains as the phone's shadow base). Owner decision D4 |
| Length | Desktop ≈ 1.6 viewports (today 0.9) — paid for by tightening Competition. Mobile ≈ 1.2 viewports, **separate choreography** (fan fills first screen → short scroll → phone enters; text readable at every step). No pin > 1 viewport |
| Complexity / Perf / A11y | **L** / medium (≈6 layers; avoid animated masks, use a `scaleY` wave overlay) / medium (DOM order unchanged, hand stays operable; reduced-motion & JS-off → today's static composition) |
| Fallback | `@supports` CSS timelines → rAF `--p` variable for older Firefox |

### 4.3 How to Play — discovery, not description
| | |
|---|---|
| Works | Truthful two steps; real control highlighted; crop capped at quality-safe size |
| Generic | Text left, picture right, ring. Passive |
| Keep | No invented rules; two steps; real screenshot; quality cap |
| Change | **Quiet scene:** on entry the phone's other buttons dim (opacity .35) and a yellow ring **draws itself once** around the real How to Play control (≈600 ms); step labels become **chips 01 DOWNLOAD / 02 TAP HOW TO PLAY** with a leader line to the control. Quiet type scale |
| Constraint | The screenshot is 500 px wide. "Phone fills the scene" would upscale and soften it; I'll scale the *composition* (type, chips, space), not the raster, and keep the 340 px cap until a better screenshot arrives |
| Complexity / Perf / A11y | S–M / low / low (ring decorative; steps are real text) |

### 4.4 Competition — a fixture, not a card
| | |
|---|---|
| Works | Dark arena gradient, poster headline "PLAY FOR THE WIN.", honest states (no time → no countdown; postponed handling; no fake registration) |
| Generic | A black rounded rectangle (label · date · button) beside the heading; prizes (verified, recurring) aren't in the arena at all; the scene is **33% of the whole page**, much of it open blue |
| Keep | Arena gradient, headline, honesty rules, the data model |
| Change | **Fixture board** set directly in the environment: giant outlined **27** (tabular), `TOURNAMENT` tag, **12 DEC 2026** in scoreboard numerals with chip separators, `REGISTER IN THE ALBASTINI APP`, CTA. **Prize ladder**: three ascending steps, bar length proportional to the amounts (26k / 65k / 130k), driven by `tournamentPrizeStructure`, `scaleX` once on entry, numbers static (no counting) — a ranking ladder, not a pricing table. Start time/countdown slot appears automatically when verified |
| Scene length | Competition-only ≈ 1.5 viewports (Champions becomes its own scene, §4.5) |
| Complexity / Perf / A11y | M / low (3 `scaleX` bars, once) / low–med (ladder = real `<ol>` text, bars `aria-hidden`) |

### 4.5 Champions — collectible covers
| | |
|---|---|
| Works | Native scroll-snap swipe (verified), keyboard + live region, JS-off list, data-driven prizes, no autoplay |
| Generic | Every slide is the same 4:5 rounded rectangle with text beside it; transition = plain slide; the three photos clash (backlit selfie cut-out, full-body event shot, poster cut-out) and only a blue gradient unifies them |
| Keep | The scroll-snap engine and all a11y behaviour |
| Change | Each slide = a **cover**: oversized outlined rank numeral behind; photo bottom-anchored **breaking the frame's top keyline**; **nameplate cut in the card-wave** carrying name / location / prize; collector index "No. 01 / 03"; a card-edge notch. Transition choreography follows the finger: numeral SLIDEs, photo 60 ms later, metadata SETTLEs, prize resolves. Rank tints from the brand palette only (D7) |
| Honest limit | The frame can **unify**, not **repair**, the sources: David 720×880 (soft at 2×), Bedadi full-scene, MJeshi extracted from a poster. At poster scale those limits show. Recommendation: request original photos; meanwhile grade the *background plate* only, never skin or identity |
| Complexity / Perf / A11y | M–L / medium (3 slides × photo+numeral layers; transform/opacity only; no filters) / medium (effects can't trap focus; numerals `aria-hidden`; reduced-motion = no choreography) |

### 4.6 Physical Cards — product cinema
| | |
|---|---|
| Works | Product-first hierarchy, real fronts-on-white photo, Safari box rises through the arena edge, honest availability, closed form |
| Generic | Cut-outs placed over a photo; nothing is tactile; plain accordion for the form |
| Keep | Product-first order, the box rise, honest copy, closed form |
| Change | **Safari box as hero object; a fuller fan of official cards escapes behind it** (red, black, blue + green, purple, teal, orange, giraffes are already in the pack). Pointer/focus raises a card (6–8 px); activate → **TURN** (rotateY, 520 ms) to the approved official back. Roving-tabindex selection like the existing hand; cursor chip "FLIP" (fine pointers). Fronts-on-white photo stays as the table grounding. Form restyled to the Albastini field system (still closed) |
| Prerequisite | **Card geometry normalisation** (§6) — otherwise the flip visibly changes shape |
| Complexity / Perf / A11y | **L** / medium (3D on ≤ 6 cards, interaction-triggered only, no loops) / **medium–high** (button semantics, `aria-pressed`, alt text for *both* faces, focus kept on the card, reduced-motion = instant swap) |

### 4.7 Finale and footer — end on a poster
| | |
|---|---|
| Works | Strong poster typography, correct phrase, both CTAs, quiet footer, cards crossing the edge |
| Generic | The fan is a corner ornament; footer is a standard row; pill buttons |
| Change | **Poster composition:** night field; the **crown token** huge and partly cropped behind the type with its 11-point ring; a full fan bleeding off both edges; "READY TO PLAY?" at poster scale; **INGIA UWANJANI TUCHEZE.** as the signature line with chip bullets; new button grammar. **Footer as signature block:** mark + phrase, links with chip-marker hover, restyled language control, a legal/metadata line only when verified. Held static frame at the end (no loops) |
| Complexity / Perf / A11y | M / low–med / low |

---

## 5. Scroll pacing & density (target rhythm)
Hero dense → Table/Screen immersive → How to Play focused → Arena high-intensity → Champions editorial → Physical tactile → Finale maximum.
Concrete targets: Competition+Champions from **33% → ≈ 27%** of scroll even after gaining a richer fixture, by splitting them into two purposeful scenes; Table/Screen **14% → ≈ 20%** (the signature earns it); remove open-blue travel above the fixture. Final numbers decided at the M0 storyboard, then measured.

## 6. Asset prerequisites and risks

| # | Item | Why | Options / recommendation |
|---|---|---|---|
| A1 | **Card geometry** | Fronts 1.365–1.414, back **1.45**, widths ±12.5% | (i) Uniformly scale every card to one common width, then crop each to a canonical 1.40 frame (the back loses ≈3.4% of its height, so the owner must approve that crop); (ii) keep native ratios, flip crops the back with `cover`; (iii) **best:** the card designer re-exports all 9 on one identical canvas. I recommend (iii), with (i) as the stopgap |
| A2 | Register the official back + 5 more fronts | Not in the registry yet | Straightforward; derivatives ≥ 800 px for flip |
| A3 | Champion photos | Limits in §4.5 | Ask winners/team for originals |
| A4 | More app screens | Table/Screen and How to Play currently reuse one screenshot | Gameplay + tournament screens would unlock distinct scenes |
| A5 | Wordmark | None supplied | Nav uses the mark only |
| A6 | Community photos | Still none | Reserved slots only; nothing generated |
| R1 | Firefox < 159 | Native scroll timelines missing | `@supports` + rAF fallback; cannot test Firefox/WebKit here |
| R2 | Motion judged on stills | I can't feel motion | I'll supply frame sequences + jank metrics; owner reviews live |

## 7. Accessibility matrix for every bespoke interaction
| Interaction | Keyboard | Touch | Reduced motion | Semantics |
|---|---|---|---|---|
| Nav marker + themes | Native links/focus | Native | Instant marker | `aria-current` on active link |
| Cursor token | Label chip on focus | Chip on tap | No cursor motion | Decorative (`aria-hidden`) |
| Hero deal / depth | n/a (decorative) | n/a | Final state, no depth | Decorative images stay `aria-hidden`/described once |
| Table → Screen | Hand = tabs (existing) | Native scroll | Static composition | DOM order = reading order |
| Card flip / selection | Roving tabindex, Enter/Space | Tap | Instant swap | Button + `aria-pressed`, both faces labelled |
| Prize ladder | Reads as list | — | No bar growth | `<ol>` with real values |
| Champions choreography | Arrows/dots (existing) | Native swipe | None | Existing carousel pattern |

## 8. Implementation plan (design first)

Branch: `feature/award-revamp` off the verified baseline; every push gets a Vercel preview; **production only on owner approval**.

| Milestone | Deliverable | Size | Gate |
|---|---|---|---|
| **M0 — Design boards** (no scene code) | Static, reviewable boards: type specimen (poster/editorial/quiet/meta), button + state sheet, nav in 3 themes, champion cover ×3 with the *real* photos, prize ladder, hero-deal storyboard, Table→Screen storyboard (desktop + mobile, 5 frames each), card-geometry test | M | **G0: owner approves direction** |
| M1 — Foundations | Radius/keyline/motion-verb tokens, `data-theme` scenes, focus system, perf/a11y scripts that fail on budget breach | M | axe 0 · budgets pass |
| M2 — Nav + buttons + form/footer link states | §3.1–3.2 | M | G2 visual review |
| M3 — Hero deal + pointer depth | §4.1 | M | LCP/INP unchanged |
| M4 — Table → Screen (desktop, then mobile) | §4.2, fallback path | L | G4 motion review on real devices |
| M5 — Type pass + How to Play | §3.4, §4.3 | M | line-break audit 320–2560 |
| M6 — Competition fixture + ladder | §4.4 | M | data-change tests |
| M7 — Champions covers | §4.5 | M–L | swipe/keyboard tests |
| M8 — Physical product cinema | §4.6 (needs A1/A2) | L | flip a11y suite |
| M9 — Finale + footer + T1/T3/T4 | §4.7, §3.5 | M | G9 |
| M10 — QA | micro-interaction sweep, 320–2560 art direction, perf/a11y, motion recording review | M | owner final review |

## 9. Decisions needed

| # | Decision | My recommendation |
|---|---|---|
| D1 | Ship the **current verified build to production now**, and do the revamp on a branch? | **Yes.** Production still runs the old site (open admin, fake stats, stale tournament, vulnerable framework) |
| D2 | Approve M0 boards before any scene code? | Yes |
| D3 | Card geometry route (A1) | (iii), with (i) as stopgap |
| D4 | Table→Screen: deck→hand-off vs literal morph | Hand-off (a morph distorts) |
| D5 | Hero: full `100svh` composition vs deliberate peek of the next scene | Full composition |
| D6 | Cursor token only on actionable cards (not the hero) | Yes |
| D7 | Champion rank tints (brand palette only) | Gold / paper / blue-on-night; avoid a medal-cliché |
| D8 | Champion photo plan | Request originals; unify plate meanwhile |
| D9 | Sound | Defer (opt-in, after visual craft) |
