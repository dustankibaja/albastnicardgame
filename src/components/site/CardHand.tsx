import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Picture } from "./Picture";
import type { SiteImageId } from "@/content/assets";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Reusable card interaction: a hand of real Albastini card fronts that act as
 * tabs. All cards stay visible; the selected one rises ~8px and the copy
 * beside it changes. Never flips (no genuine card back exists).
 *
 * Keyboard: Left/Right (or Up/Down), Home/End; Tab moves into the copy.
 * Reduced motion: no movement; selection shown by outline and label.
 */
export type HandCard = {
  id: SiteImageId;
  alt: TKey;
  title: TKey;
  body: TKey;
  /** text colour class for the title (brand colour of the card) */
  tone: string;
  rotate: number;
};

export function CardHand({ cards, label }: { cards: HandCard[]; label: TKey }) {
  const { t } = useI18n();
  const uid = useId();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number) => {
    const n = (i + cards.length) % cards.length;
    setActive(n);
    tabs.current[n]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(active + 1),
      ArrowDown: () => select(active + 1),
      ArrowLeft: () => select(active - 1),
      ArrowUp: () => select(active - 1),
      Home: () => select(0),
      End: () => select(cards.length - 1),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  const current = cards[active]!;

  return (
    <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-end md:gap-10">
      <div
        role="tablist"
        aria-label={t(label)}
        onKeyDown={onKey}
        className="flex justify-center pt-4 sm:justify-start"
      >
        {cards.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "group relative -mx-[1.5%] w-[34%] max-w-[180px] shrink-0 rounded-[9%] text-left outline-offset-4 first:ml-0 md:w-[140px] xl:w-[160px]",
                "transition-transform duration-[var(--dur-std)] ease-[var(--ease-out)]",
                "motion-safe:hover:-translate-y-1",
                selected ? "z-10 motion-safe:-translate-y-2.5" : "z-0",
              )}
              style={{ rotate: `${c.rotate}deg` }}
            >
              <Picture
                id={c.id}
                alt={t(c.alt)}
                sizes="(min-width: 1280px) 160px, (min-width: 768px) 140px, 34vw"
                className={cn(
                  "overflow-hidden rounded-[8%] shadow-[0_24px_40px_-20px_rgb(0_0_0/0.55)] ring-offset-2",
                  selected ? "ring-4 ring-alba-blue" : "ring-0",
                )}
              />
              <span
                className={cn(
                  "label mt-3 block text-center",
                  selected ? "text-alba-ink" : "text-muted-foreground",
                )}
              >
                {t(c.title)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        className="min-h-[11rem] max-w-md lg:max-w-[17rem] xl:min-w-[17rem] xl:max-w-md"
      >
        <p aria-hidden className="label text-muted-foreground">
          {t("two.hint")}
        </p>
        <h3 key={`${active}-t`} className={cn("display-xl type-editorial mt-2", current.tone)}>
          {t(current.title)}
        </h3>
        <p key={`${active}-b`} className="type-lede mt-3 max-w-[32ch]">
          {t(current.body)}
        </p>
      </div>
    </div>
  );
}
