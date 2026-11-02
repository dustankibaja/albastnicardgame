import { Picture } from "./Picture";
import { hasImage } from "@/content/assets";
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
 * Winner presentation system (championship editorial, not casino):
 *  - WinnerFeature (1st): oversized outlined rank numeral; when a genuine
 *    portrait is registered it stands in front of the numeral, fading into
 *    the arena at the bottom (CSS mask: no background removal needed), and
 *    the name overlaps its lower part. Without a portrait: typographic.
 *  - WinnerSupport (2nd/3rd): same anatomy, smaller.
 * Never a placeholder person.
 */

export function WinnerFeature({ winner }: { winner: Winner }) {
  const { t } = useI18n();
  const place = usePlace(winner);
  const portrait = winner.imageId && hasImage(winner.imageId) ? winner.imageId : null;

  return (
    <article
      className={cn(
        "relative grid items-end gap-6 lg:grid-cols-12",
        portrait && "pt-[clamp(4rem,10vw,6rem)]",
      )}
    >
      <div className="relative lg:col-span-5">
        <span
          aria-hidden
          className={cn(
            "display-xl block select-none leading-[0.78] text-transparent [-webkit-text-stroke:3px_var(--alba-gold)]",
            "text-[clamp(14rem,48vw,30rem)]",
            portrait && "max-lg:text-[clamp(16rem,52vw,24rem)]",
          )}
        >
          {winner.position}
        </span>
        {portrait ? (
          <Picture
            id={portrait}
            alt={winner.imageAltKey ? t(winner.imageAltKey) : winner.name}
            sizes="(min-width: 1024px) 34vw, 70vw"
            className="absolute bottom-0 left-[8%] aspect-[720/880] h-[132%] lg:left-[12%] lg:h-[118%]"
            imgClassName="h-full w-full object-contain [mask-image:radial-gradient(ellipse_64%_84%_at_48%_38%,black_50%,transparent_100%)]"
          />
        ) : null}
      </div>

      <div className={cn("relative lg:col-span-7", portrait && "lg:-ml-[16%] lg:pb-6")}>
        <p className="label inline-block rounded-full bg-alba-gold px-4 py-1.5 text-alba-ink">
          {place}
        </p>
        <h4 className="display-xl mt-5 text-[clamp(3.5rem,10vw,8.5rem)]">{winner.name}</h4>
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
  const portrait = winner.imageId && hasImage(winner.imageId) ? winner.imageId : null;
  return (
    <article className="relative flex items-end gap-5 border-t-2 border-alba-paper/25 pt-6">
      <span
        aria-hidden
        className="display-xl text-[7rem] leading-[0.8] text-transparent [-webkit-text-stroke:2px_var(--alba-paper)]"
      >
        {winner.position}
      </span>
      {portrait ? (
        <Picture
          id={portrait}
          alt={winner.imageAltKey ? t(winner.imageAltKey) : winner.name}
          sizes="120px"
          className="w-28 shrink-0 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
        />
      ) : null}
      <div>
        <p className="label text-alba-gold">{place}</p>
        <h4 className="display-xl mt-1 text-4xl">{winner.name}</h4>
        <dl className="mt-2 text-base text-alba-paper/85">
          {winner.prize ? (
            <div className="flex gap-2">
              <dt>{t("win.prize")}:</dt>
              <dd>{winner.prize}</dd>
            </div>
          ) : null}
          {winner.location ? (
            <div className="flex gap-2">
              <dt>{t("win.location")}:</dt>
              <dd>{winner.location}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
