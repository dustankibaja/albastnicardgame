# Albastini website — M5 release status

Status: **not ready to publish** until the BLOCKERS below are closed.

## Swahili review (owner decision required)

Translations stay centralised in `src/lib/i18n.tsx`. Nothing below has been changed
without owner approval.

| Key | English | Current Kiswahili | Confidence / concern |
|---|---|---|---|
| phys.fanLabel | Albastini cards | Karata za Albastini | Medium: product-name usage; confirm capitalisation |
| alt.cardBack | Albastini card back | Upande wa nyuma wa karata ya Albastini | High |
| arena.prizeLabel | Prize ladder | **Zawadi** | **APPROVED by owner.** Preferred public wording for the cash prize. Do not use "Tuzo" |
| arena.startTbc | Start time to be announced | Muda wa kuanza utatangazwa | High |
| arena.nextLabel | Tournament #27 | Mashindano #27 | High |
| arena.proof | These people already did. | **Hawa tayari wameshinda.** | **APPROVED by owner.** Natural marketing translation conveying that these players have already won |

No existing Kiswahili string was changed during the revamp. Both uncertain strings above are now approved; no other translation was altered.

## BLOCKERS (must fix before a public launch)

1. **Social preview image.** `og:image` is absent. The candidate is in
   `docs/review/og-candidate-1200x630-OWNER-APPROVAL-REQUIRED.png`, built only from
   approved brand files. It is NOT active until the owner approves it.
2. **Production performance and deployment check.** The earlier figures came from the
   development server and are not release numbers. Measure LCP, CLS and interaction
   latency on the deployed production URL after this checkpoint is deployed.

## MANUAL QA (owner or device verification)

### iPhone / Safari (iOS version, device and orientation to be recorded)
1. Hero first frame (cards and phone do not hide the navigation or CTA)
2. Navigation and mobile menu open and close
3. Table → Screen forward and reverse scroll
4. Rotate portrait ↔ landscape at the hero and at Table → Screen
5. Champions swipe, arrows and index
6. Physical Card tap to turn, and turn back
7. Form layout and keyboard (sign-up is closed; confirm the closed message reads clearly)
8. Finale and footer

Record for every issue: device, iOS version, browser, orientation, section, problem.

### Android / Chrome (device, Android version and Chrome version to be recorded)
Repeat the same eight checks. Record actual defects only.

### Firefox and Safari desktop
Not automated in this environment (browser installation blocked). Check the hero,
Table → Screen, the menu, the carousel and the card turn.

### Issue report format (required for every defect)

```
Device:
OS:
Browser:
Orientation:
Section:
Observed problem:
```

Record only actual visible or functional defects.

## POST-LAUNCH (does not affect visitors)

- Remove the unused shadcn scaffolding in `src/components/ui/` and prune its Radix
  dependencies (tree-shaken from the bundle, so no visitor impact).
- Decide whether a restrained DEAL entrance for the Physical Cards fan is worth adding
  after real-device review. It is currently static by choice.
- Replace the production `robots.txt`/`sitemap.xml` generation check with a deployment test.
