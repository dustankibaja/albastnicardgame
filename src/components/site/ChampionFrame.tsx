import { Picture } from "./Picture";
import { hasImage } from "@/content/assets";
import type { Winner } from "@/content/winners";
import { cn } from "@/lib/utils";

/**
 * ChampionFrame — one branded stage for ANY winner photo.
 *
 * Real winners send inconsistent photos (portrait, landscape, full-body,
 * compressed, busy backgrounds). The frame never forces aggressive cropping:
 *  - imageFit "cover"   → fills the 4:5 stage; imagePosition picks the crop
 *  - imageFit "contain" → whole image shown; the stage absorbs the empty space
 *    (cut-outs anchor to the bottom and rise out of the stage)
 * No photo → the outlined placement numeral (never a placeholder person).
 * Prestige comes from frame, keyline and scale — no trophies, no confetti.
 */
export function ChampionFrame({
  winner,
  alt,
  placeLabel,
  priority = false,
  className,
}: {
  winner: Winner;
  alt: string;
  placeLabel: string;
  priority?: boolean;
  className?: string;
}) {
  const portrait = winner.portrait && hasImage(winner.portrait) ? winner.portrait : null;
  const fit = winner.imageFit ?? "cover";

  return (
    <figure className={cn("relative", className)}>
      {/* Frame: night-blue mat + restrained yellow keyline */}
      <div className="relative aspect-[4/5] rounded-[1.75rem] bg-alba-night p-2.5 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)] ring-1 ring-alba-gold/70">
        <div
          className="relative h-full w-full overflow-hidden rounded-[1.25rem]"
          style={{
            background:
              "radial-gradient(120% 85% at 50% 18%, color-mix(in oklab, var(--alba-blue) 78%, var(--alba-paper)) 0%, var(--alba-blue) 42%, var(--alba-night) 100%)",
          }}
        >
          {/* Brand geometry: the card-face wave, low and quiet */}
          <svg
            aria-hidden
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-[26%] w-full opacity-60"
          >
            <path
              d="M0 52 C 70 12, 160 6, 220 34 S 340 86, 400 40 L 400 120 L 0 120 Z"
              fill="var(--alba-night)"
            />
          </svg>

          {portrait ? (
            <Picture
              id={portrait}
              alt={alt}
              priority={priority}
              sizes="(min-width: 1024px) 440px, 86vw"
              className="absolute inset-0"
              imgClassName={cn(
                "h-full w-full",
                fit === "contain" ? "object-contain" : "object-cover",
              )}
              imgStyle={{
                objectPosition:
                  winner.imagePosition ?? (fit === "contain" ? "50% 100%" : "50% 30%"),
              }}
            />
          ) : (
            <span
              aria-hidden
              className="display-xl absolute inset-0 grid place-items-center text-[clamp(10rem,40vw,18rem)] text-transparent [-webkit-text-stroke:3px_var(--alba-gold)]"
            >
              {winner.placement}
            </span>
          )}

          {/* Grounding: the photo settles into the arena at the bottom edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-alba-night/90 to-transparent"
          />
        </div>
      </div>

      {/* Placement indicator */}
      <figcaption className="absolute -top-3 left-5">
        <span className="label inline-block rounded-full bg-alba-gold px-4 py-1.5 text-alba-ink shadow-[0_6px_16px_-6px_rgb(0_0_0/0.6)]">
          {placeLabel}
        </span>
      </figcaption>
    </figure>
  );
}
