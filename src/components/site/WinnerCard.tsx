import type { Winner } from "@/content/winners";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const placeLabel: Record<number, TKey> = { 1: "win.p1", 2: "win.p2", 3: "win.p3" };

/**
 * One verified winner. Works with or without a portrait: when `image` is
 * missing, no placeholder photo is shown — the record is text only.
 */
export function WinnerCard({ winner, featured = false }: { winner: Winner; featured?: boolean }) {
  const { t } = useI18n();
  const key = placeLabel[winner.position];
  const place = key ? t(key) : t("win.place", { n: winner.position });

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-3xl border bg-card",
        winner.position === 1 ? "border-2 border-alba-gold" : "border-border",
      )}
    >
      {winner.image ? (
        <div className="aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={winner.image}
            alt={winner.imageAlt ?? winner.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className={cn("flex flex-1 flex-col", featured ? "p-7 sm:p-9" : "p-6")}>
        <p className="w-fit rounded-full bg-alba-gold px-3 py-1 text-sm font-bold text-alba-ink">
          {place}
        </p>
        <h3
          className={cn(
            "display-xl mt-5 leading-tight",
            featured ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          {winner.name}
        </h3>
        <dl className="mt-5 grid gap-3 text-base">
          {winner.prize ? (
            <div>
              <dt className="text-sm text-muted-foreground">{t("win.prize")}</dt>
              <dd className="font-display text-xl font-extrabold">{winner.prize}</dd>
            </div>
          ) : null}
          {winner.location ? (
            <div>
              <dt className="text-sm text-muted-foreground">{t("win.location")}</dt>
              <dd>{winner.location}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
