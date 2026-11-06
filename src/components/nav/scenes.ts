/**
 * NAVIGATION SCENES — the single source of truth for the navigation.
 *
 * Each entry is a page section that starts a new navigation chapter. A chapter
 * begins when that section's top edge reaches the bottom of the navigation bar.
 * Theme and active destination are resolved together from this table, so they
 * can never disagree.
 *
 * Declared explicitly; never inferred from computed background colour
 * (#tournaments is a blue→night gradient).
 */
export type NavTheme = "hero" | "paper" | "night";

export type NavScene = {
  /** DOM id of the section that begins the chapter. */
  section: string;
  theme: NavTheme;
  /** Navigation destination that is current in this chapter (null = none). */
  active: string | null;
};

/** Ordered by document position. The LAST chapter whose section has reached the bar wins. */
export const navScenes: NavScene[] = [
  { section: "top", theme: "hero", active: null },
  { section: "play", theme: "paper", active: "play" },
  { section: "how-to-play", theme: "paper", active: "how-to-play" },
  { section: "tournaments", theme: "night", active: "tournaments" },
  { section: "cards", theme: "paper", active: "cards" },
  { section: "finale", theme: "night", active: null },
];

/** Ordered anchors for the navigation (labels come from i18n). */
export const navAnchors = [
  { id: "play", key: "nav.play" },
  { id: "how-to-play", key: "nav.howto" },
  { id: "tournaments", key: "nav.tournaments" },
  { id: "cards", key: "nav.cards" },
] as const;
