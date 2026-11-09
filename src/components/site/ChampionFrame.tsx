import { Picture } from "./Picture";
import { Numeral } from "./Numeral";
import { hasImage } from "@/content/assets";
import { formatPrize, prizeFor, type Winner } from "@/content/winners";
import { cn } from "@/lib/utils";

/*
 * CHAMPION FRAME — one collectible system, two photo modes.
 *
 *   portrait-cutout  a figure extracted from its background; it rises out of
 *                    the frame and the wave-cut nameplate sits over its base.
 *   editorial-photo  a scene kept whole; the environment is part of the
 *                    photograph, so the frame only keys and grades its edge.
 *
 * Shared, identical in every mode: outer ratio, yellow keyline, wave edge,
 * rank architecture (outlined numeral), placement chip, collector index,
 * nameplate (name, location, prize), and Tournament metadata.
 * The photograph is the only thing that changes.
 */
export function ChampionFrame({
  winner,
  index,
  total,
  alt,
  placeLabel,
  tournamentLabel,
  priority = false,
  className,
}: {
  winner: Winner;
  /** 1-based collector index, e.g. 1 of 3. */
  index: number;
  total: number;
  alt: string;
  placeLabel: string;
  tournamentLabel: string;
  priority?: boolean;
  className?: string;
}) {
  const mode = winner.photoMode ?? "editorial-photo";
  const portrait = winner.portrait && hasImage(winner.portrait) ? winner.portrait : null;
  const prize = formatPrize(prizeFor(winner.placement));
  const rankText = String(winner.placement).padStart(2, "0");

  return (
    <figure
      className={cn(
        "champion relative mx-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden rounded-[1.75rem]",
        "bg-alba-night ring-1 ring-alba-gold/80",
        className,
      )}
      data-photo-mode={mode}
    >
      {/* the stage: blue light falling on the arena */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 16%, color-mix(in oklab, var(--alba-blue) 80%, var(--alba-paper)) 0%, var(--alba-blue) 44%, var(--alba-night) 100%)",
        }}
      />

      {/* rank architecture: outlined numeral behind the photograph */}
      <div className="champion-rank" aria-hidden="true">
        <Numeral role="rank" outline>
          {rankText}
        </Numeral>
      </div>

      {/* the photograph, in its mode */}
      {portrait ? (
        <div className={cn("champion-photo", `champion-photo--${mode}`)}>
          <Picture
            id={portrait}
            alt={alt}
            priority={priority}
            sizes="(min-width: 1024px) 440px, 86vw"
            className="absolute inset-0"
            imgClassName={cn(
              "h-full w-full",
              mode === "portrait-cutout" ? "object-contain object-bottom" : "object-cover",
            )}
            imgStyle={{
              objectPosition:
                winner.imagePosition ?? (mode === "portrait-cutout" ? "50% 100%" : "55% 30%"),
            }}
          />
        </div>
      ) : null}

      {/* the wave-cut nameplate boundary */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        className="champion-wave"
      >
        <path
          d="M0 40 C 80 6, 170 2, 230 30 S 340 78, 400 36 L400 120 L0 120 Z"
          fill="var(--alba-night)"
        />
        <path
          d="M0 40 C 80 6, 170 2, 230 30 S 340 78, 400 36"
          fill="none"
          stroke="var(--alba-gold)"
          strokeWidth="1.6"
        />
      </svg>

      {/* top metadata: tournament + collector index */}
      <div className="champion-top">
        <span className="meta-label">{tournamentLabel}</span>
        <span className="meta-label champion-index">
          <Numeral role="points" className="champion-index-num">
            {String(index).padStart(2, "0")}
          </Numeral>
          <span aria-hidden="true">/</span>
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* placement chip */}
      <span className="champion-place">
        <svg viewBox="0 0 40 40" aria-hidden="true" className="champion-place-disc">
          <circle cx="20" cy="20" r="18.6" />
          <circle
            cx="20"
            cy="20"
            r="12.6"
            fill="none"
            stroke="var(--alba-night)"
            strokeWidth="2.2"
            strokeDasharray="4.1 3.5"
          />
        </svg>
        {placeLabel}
      </span>

      {/* nameplate: name, location, prize (prize in tabular numerals, TSH secondary) */}
      <figcaption className="champion-plate">
        <span className="champion-name display-xl">{winner.displayName}</span>
        <span className="champion-meta">
          <span className="champion-loc">{winner.location}</span>
          <Numeral role="prize" unit="TSH">
            {prize.replace(" TSH", "")}
          </Numeral>
        </span>
      </figcaption>
    </figure>
  );
}
