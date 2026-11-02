import type { Winner } from "@/content/winners";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const placeLabel: Record<number, TKey> = { 1: "win.p1", 2: "win.p2", 3: "win.p3" };

function usePlace(w: Winner) {
  const { t } = useI18n();
  const key = placeLabel[w.position];
  return key ? t(key) : t("win.place", { n: w.position });
}

/*
 * Winner presentation system.
 *  - WinnerFeature: the top finisher. Prestige from scale: an oversized rank
 *    numeral, the name set huge, prize and place as badges. If a real
 *    portrait is supplied it sits behind the name (name overlaps its lower
 *    part); without one the record is purely typographic. Never a placeholder.
 *  - WinnerSupport: 2nd/3rd, same anatomy at smaller scale.
 */

export function WinnerFeature({ winner }: { winner: Winner }) {
  const { t } = useI18n();
  const place = usePlace(winner);
  const hasImage = Boolean(winner.image);

  return (
    <article className="relative grid items-end gap-6 md:grid-cols-12">
      <div aria-hidden className="relative md:col-span-5">
        <span className="display-xl block select-none text-[clamp(14rem,48vw,30rem)] leading-[0.78] text-transparent [-webkit-text-stroke:3px_var(--alba-gold)]">
          {winner.position}
        </span>
        {hasImage ? (
          <img
            src={winner.image}
            alt=""
            loading="lazy"
            className="absolute bottom-0 left-[12%] h-[105%] w-auto object-contain"
          />
        ) : null}
      </div>

      <div className={cn("relative md:col-span-7", hasImage && "md:-ml-[18%]")}>
        <p className="label inline-block rounded-full bg-alba-gold px-4 py-1.5 text-alba-ink">
          {place}
        </p>
        <h4 className="display-xl mt-5 text-[clamp(3.5rem,10vw,8.5rem)]">{winner.name}</h4>
        {hasImage && winner.imageAlt ? <p className="sr-only">{winner.imageAlt}</p> : null}
        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          {winner.prize ? (
            <div>
              <dt className="label text-alba-paper/80">{t("win.prize")}</dt>
              <dd className="display-xl mt-1 text-[clamp(2.5rem,5vw,4rem)] text-alba-gold">
                {winner.prize}
              </dd>
            </div>
          ) : null}
          {winner.location ? (
            <div>
              <dt className="label text-alba-paper/80">{t("win.location")}</dt>
              <dd className="mt-2 text-2xl font-semibold">{winner.location}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

export function WinnerSupport({ winner }: { winner: Winner }) {
  const { t } = useI18n();
  const place = usePlace(winner);
  return (
    <article className="relative flex items-end gap-5 border-t-2 border-alba-paper/25 pt-6">
      <span
        aria-hidden
        className="display-xl text-[7rem] leading-[0.8] text-transparent [-webkit-text-stroke:2px_var(--alba-paper)]"
      >
        {winner.position}
      </span>
      {winner.image ? (
        <img
          src={winner.image}
          alt={winner.imageAlt ?? ""}
          loading="lazy"
          className="h-28 w-auto object-contain"
        />
      ) : null}
      <div>
        <p className="label text-alba-gold">{place}</p>
        <h4 className="display-xl mt-1 text-4xl">{winner.name}</h4>
        <p className="mt-2 text-base text-alba-paper/85">
          {[winner.prize, winner.location].filter(Boolean).join(", ")}
        </p>
        <span className="sr-only">{t("win.prize")}</span>
      </div>
    </article>
  );
}
