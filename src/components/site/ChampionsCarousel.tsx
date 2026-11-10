import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChampionFrame } from "./ChampionFrame";
import { Numeral } from "./Numeral";
import type { Tournament } from "@/content/tournaments";
import { formatPrize, prizeFor, type Winner } from "@/content/winners";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const placeKey: Record<number, TKey> = { 1: "win.p1", 2: "win.p2", 3: "win.p3" };

/**
 * ChampionsCarousel — one slide per verified winner of a tournament (1, 2 or 3+).
 *
 * Built on native horizontal scroll-snap:
 *  - touch: the browser's own swipe (works even before JS hydrates)
 *  - pointer: previous / next arrows + slide indicators (rendered after mount,
 *    so no dead controls without JavaScript)
 *  - keyboard: the slide viewport is focusable; ←/→ move between champions
 *  - reduced motion: instant jumps instead of smooth scrolling
 * No autoplay (optional in the brief; omitted to avoid motion/a11y risk).
 * Pattern: WAI-ARIA carousel (roledescription carousel / slide).
 */
export function ChampionsCarousel({
  tournament,
  winners,
}: {
  tournament: Tournament;
  winners: Winner[];
}) {
  const { t } = useI18n();
  const uid = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const slides = [...winners].sort((a, b) => a.placement - b.placement);
  const count = slides.length;

  useEffect(() => setReady(true), []);

  // Track the visible slide from the scroll position (swipe, arrows, keys).
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
        setIndex(Math.max(0, Math.min(count - 1, i)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  const goTo = useCallback(
    (i: number) => {
      const el = viewport.current;
      if (!el) return;
      const n = Math.max(0, Math.min(count - 1, i));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: n * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
      setIndex(n);
    },
    [count],
  );

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const label = t("car.label", { n: tournament.number });

  return (
    <section aria-roledescription="carousel" aria-label={label} className="relative">
      <div
        ref={viewport}
        id={`${uid}-viewport`}
        tabIndex={0}
        onKeyDown={onKey}
        aria-label={label}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((w, i) => {
          const place = t(placeKey[w.placement] ?? "win.p1");
          return (
            <div
              key={w.id}
              role="group"
              aria-roledescription="slide"
              aria-label={t("car.slide", { i: i + 1, n: count })}
              className="w-full shrink-0 snap-start snap-always px-1 pt-4"
            >
              <article
                className={cn(
                  "grid items-center champ-slide",
                  i === index && "champ-slide--active",
                )}
              >
                <ChampionFrame
                  winner={w}
                  index={i + 1}
                  total={count}
                  alt={w.portraitAltKey ? t(w.portraitAltKey) : w.displayName}
                  placeLabel={place}
                  tournamentLabel={t("tour.numbered", { n: tournament.number })}
                  priority={false}
                  className="champion-scale"
                />
              </article>
            </div>
          );
        })}
      </div>

      {/* environment: the current rank, behind the cover */}
      <div className="champ-env" aria-hidden="true">
        <Numeral role="rank" outline>
          {String(winners[index]?.placement ?? 1).padStart(2, "0")}
        </Numeral>
      </div>

      {ready && count > 1 ? (
        <div className="champ-controls mt-8">
          {/* primary state: the collector index, in the numeric grammar */}
          <p className="champ-index" aria-hidden="true">
            <Numeral role="points" className="champ-index-cur">
              {String(index + 1).padStart(2, "0")}
            </Numeral>
            <span className="champ-index-sep">/</span>
            <span className="champ-index-tot">{String(count).padStart(2, "0")}</span>
          </p>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-controls={`${uid}-viewport`}
            aria-label={t("car.prev")}
            className="champ-arrow"
          >
            <ChevronLeft aria-hidden className="size-6" />
          </button>
          <div className="flex items-center gap-1">
            {slides.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => goTo(i)}
                aria-controls={`${uid}-viewport`}
                aria-current={i === index ? "true" : undefined}
                aria-label={t("car.goto", {
                  name: w.displayName,
                  place: t(placeKey[w.placement] ?? "win.p1"),
                })}
                className="grid size-11 place-items-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    "block h-2.5 rounded-full transition-all duration-[var(--dur-std)]",
                    i === index ? "w-8 bg-alba-gold" : "w-2.5 bg-alba-paper/45",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === count - 1}
            aria-controls={`${uid}-viewport`}
            aria-label={t("car.next")}
            className="champ-arrow"
          >
            <ChevronRight aria-hidden className="size-6" />
          </button>
          <p className="sr-only" aria-live="polite">
            {t("car.slide", { i: index + 1, n: count })}: {slides[index]?.displayName}
          </p>
        </div>
      ) : null}
    </section>
  );
}
