import markAsset from "@/assets/albastini-logo.webp";

/**
 * Brand mark used in the navbar and footer.
 *
 * Current asset: the authentic Albastini card-fan + crown mark (the same mark
 * that sits above the wordmark in the app's home screen). It is NOT the full
 * official logo: the official wordmark file has not been supplied yet.
 *
 * When the official logo arrives: add it to src/assets/ (SVG preferred), point
 * `src` at it, update `width`/`height` to its intrinsic ratio, and set
 * `includesWordmark: true` so the visually hidden name is no longer needed.
 */
export const brandMark = {
  src: markAsset,
  width: 256,
  height: 256,
  includesWordmark: false,
} as const;
