import { useState } from "react";
import { Picture } from "./Picture";
import { hasImage } from "@/content/assets";
import { formatPrize, winnerPrize, type Winner } from "@/content/winners";
import { cn } from "@/lib/utils";

export function ChampionFrame({
  winner,
  alt,
  placeLabel,
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
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const uploadedPhoto =
    winner.portraitUrl && winner.portraitUrl !== failedUrl ? winner.portraitUrl : null;
  const portrait = winner.portrait && hasImage(winner.portrait) ? winner.portrait : null;
  const prize = formatPrize(winnerPrize(winner));
  return (
    <figure
      className={cn(
        "mx-auto w-full max-w-[27.5rem] overflow-hidden rounded-2xl border border-white/20 bg-alba-night",
        className,
      )}
    >
      {(uploadedPhoto || portrait) && (
        <div className="relative h-[clamp(12rem,47svh,31rem)] bg-alba-night">
          {uploadedPhoto ? (
            <img
              src={uploadedPhoto}
              alt={alt}
              onError={() => setFailedUrl(uploadedPhoto)}
              className="h-full w-full object-contain"
            />
          ) : portrait ? (
            <Picture
              id={portrait}
              alt={alt}
              priority={priority}
              sizes="(min-width:1024px) 36vw, 86vw"
              className="block h-full w-full"
              imgClassName="h-full w-full object-contain"
            />
          ) : null}
        </div>
      )}
      <figcaption className="grid gap-1 border-t border-white/15 px-5 py-3 text-left text-white">
        <strong className="text-sm uppercase tracking-wide text-alba-gold">{placeLabel}</strong>
        <span className="text-xl font-bold">{winner.displayName}</span>
        <span className="text-sm">
          {winner.location} · {prize}
        </span>
      </figcaption>
    </figure>
  );
}
