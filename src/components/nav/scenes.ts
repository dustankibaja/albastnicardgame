/**
 * NAVIGATION SCENES.
 *
 * Each page section that changes the navigation's surface declares its theme
 * explicitly. The theme is NEVER inferred from computed background colour:
 * #tournaments is a blue→night gradient, so a colour sample would misread it.
 */
export type NavTheme = "hero" | "paper" | "night";

/** Section id → theme. Sections not listed inherit the previous theme. */
export const navSceneThemes: Record<string, NavTheme> = {
  top: "hero",
  play: "paper",
  "how-to-play": "paper",
  tournaments: "night",
  cards: "paper",
  "final-title": "night",
};

/** Ordered anchors for the navigation (labels come from i18n). */
export const navAnchors = [
  { id: "play", key: "nav.play" },
  { id: "how-to-play", key: "nav.howto" },
  { id: "tournaments", key: "nav.tournaments" },
  { id: "cards", key: "nav.cards" },
] as const;
