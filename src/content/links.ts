/**
 * External destinations — the ONLY place store URLs live. Components never
 * hardcode them. Both links were confirmed as the official destinations by the
 * Albastini project owner (final handoff).
 *
 * Set `url: null` to withdraw a destination: the download dialog then shows
 * only the remaining store, or an honest "coming soon" note if none remain.
 */
export type StoreLink = { url: string | null; verified: boolean };

export const appStoreLinks: { ios: StoreLink; android: StoreLink } = {
  ios: {
    url: "https://apps.apple.com/us/app/albastini-card-game/id6503353510",
    verified: true,
  },
  android: {
    url: "https://play.google.com/store/apps/details?id=com.albastini",
    verified: true,
  },
};
