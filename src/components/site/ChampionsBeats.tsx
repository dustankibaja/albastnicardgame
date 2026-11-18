import { useCallback, useEffect, useRef, useState } from "react";
import { ChampionFrame } from "./ChampionFrame";
import { Numeral } from "./Numeral";
import type { Tournament } from "@/content/tournaments";
import { formatPrize, winnerPrize, type Winner } from "@/content/winners";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * CHAMPIONS, DESKTOP — three deliberate beats driven by scroll.
 * Scrolling down moves 01 → 02 → 03; scrolling up reverses it exactly, because the
 * active beat is a pure function of scroll position. Each beat is a short SLIDE
 * with a SETTLE on the new cover. No autoplay. Controls scroll to a beat, so
 * scroll is never the only way to reach a champion.
 */
const placeKey: Record<number, TKey> = { 1: "win.p1", 2: "win.p2", 3: "win.p3" };
const BEAT_SVH = 45; // scroll length per champion, in viewport heights

export function ChampionsBeats({
  tournament,
  winners,
}: {
  tournament: Tournament;
  winners: Winner[];
}) {
  const { t } = useI18n();
  const chapter = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = winners.length;
  const label = t("car.label", { n: tournament.number });

  useEffect(() => {
    const el = chapter.current;
    if (!el) return;
    let pending = 0;
    const measure = () => {
      pending = 0;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / travel));
      const next = Math.min(count - 1, Math.floor(p * count));
      setIndex((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!pending) pending = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (pending) cancelAnimationFrame(pending);
    };
  }, [count]);

  // Move the page to the middle of a beat. The same mapping as the scroll reader, so the
  // control and the scroll always agree.
  const goTo = useCallback(
    (i: number) => {
      const el = chapter.current;
      if (!el) return;
      const target = Math.min(count - 1, Math.max(0, i));
      const travel = Math.max(1, el.offsetHeight - window.innerHeight);
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + ((target + 0.5) / count) * travel, behavior: "smooth" });
    },
    [count],
  );

  const w = winners[index];
  if (!w) return null;
  const place = t(placeKey[w.placement] ?? "win.p1");

  return (
    <div
      ref={chapter}
      role="region"
      aria-label={label}
      className="champ-beats relative"
      style={{ height: `calc(100svh + ${count * BEAT_SVH}svh)` }}
    >
      <div className="champ-beats-stage sticky top-0 flex h-[100svh] flex-col justify-center pt-[var(--nav-h)]">
        {/* THE HAND. The champions of a tournament are held like a hand of cards:
            the one in play is forward and full size in the middle, the others are
            held beside it, angled, and playing one brings it forward. Scroll and
            the rail drive the same index, so they can never disagree. */}
        <div className="champ-hand champ-stage-inner relative">
          <div className="champ-info">
            <p className="champ-info-tour">{t("tour.numbered", { n: tournament.number })}</p>
            <p className="champ-info-count">
              <Numeral role="points" className="champ-index-cur">
                {String(count).padStart(2, "0")}
              </Numeral>
              <span className="champ-info-word">{t("car.held")}</span>
            </p>
          </div>

          <div className="champ-deck relative">
            {/* the large rank changes with the champion: the environment, not a label */}
            <div className="champ-env" aria-hidden="true">
              <Numeral role="rank" outline>
                {String(w.placement).padStart(2, "0")}
              </Numeral>
            </div>
            <div className="relative z-10">
              <article key={w.id} className="champ-slide champ-slide--active grid items-center">
                <ChampionFrame
                  winner={w}
                  index={index + 1}
                  total={count}
                  alt={w.portraitAltKey ? t(w.portraitAltKey) : w.displayName}
                  placeLabel={place}
                  tournamentLabel={t("tour.numbered", { n: tournament.number })}
                  priority={false}
                  className="champion-scale"
                />
              </article>
            </div>
          </div>

          {/* A list, named — not role="group", which would strip the list
              semantics and orphan every item inside it. */}
          <ul className="champ-rail" aria-label={label}>
            {winners.map((ww, i) => (
              <li key={ww.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === index ? "true" : undefined}
                  aria-label={t("car.goto", {
                    name: ww.displayName,
                    place: t(placeKey[ww.placement] ?? "win.p1"),
                  })}
                  className="champ-card"
                  data-state={i === index ? "played" : "held"}
                  style={{ ["--tilt" as string]: `${(i - (count - 1) / 2) * 4}deg` }}
                >
                  <span className="champ-card-rank" aria-hidden="true">
                    {String(ww.placement).padStart(2, "0")}
                  </span>
                  <span className="champ-card-name">{ww.displayName}</span>
                  <span className="champ-card-place">
                    {t(placeKey[ww.placement] ?? "win.p1")} · {formatPrize(winnerPrize(ww))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="champ-controls mt-8">
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
            aria-label={t("car.prev")}
            className="champ-arrow"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === count - 1}
            aria-label={t("car.next")}
            className="champ-arrow"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      {/* every champion as text, for assistive technology and for anyone who cannot scroll */}
      <ul className="sr-only">
        {winners.map((ww) => (
          <li key={ww.id}>
            {ww.displayName}, {ww.location}, {formatPrize(winnerPrize(ww))}
          </li>
        ))}
      </ul>
    </div>
  );
}
