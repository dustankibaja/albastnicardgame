import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { ChampionsCarousel } from "./ChampionsCarousel";
import { ChampionsBeats } from "./ChampionsBeats";
import { ArenaFixture, PrizeLadder } from "./Arena";
import { Numeral } from "./Numeral";
import { Wave } from "./Wave";
import { tournaments, type Tournament } from "@/content/tournaments";
import { winners } from "@/content/winners";
import { useI18n } from "@/lib/i18n";
import { formatTournamentDate, getFeaturedTournament, getTournamentPhase } from "@/lib/tournament";

/**
 * Competition chapter: upcoming tournament + verified winners in one section.
 * All data comes from src/content/. No polling, no server reads.
 *
 * `renderedAt` comes from the route loader, so the server render and the first
 * client render use the same clock (no hydration mismatch). After mount the
 * clock ticks once a second, only while a countdown is actually visible.
 */
export function CompetitionSection({ renderedAt }: { renderedAt: number }) {
  const { t, lang } = useI18n();
  const [now, setNow] = useState(renderedAt);
  const [beatsMode, setBeatsMode] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setBeatsMode(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const featured = getFeaturedTournament(tournaments, now);
  const phase = featured ? getTournamentPhase(featured, now) : null;
  const ticking = Boolean(featured?.startAt) && phase === "upcoming";

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!ticking) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  // Champions: the most recent tournament that has verified winners.
  // (Older groups stay in the data; the carousel shows the latest.)
  const champions = (() => {
    const withWinners = tournaments
      .filter((tr) => winners.some((w) => w.tournamentId === tr.id))
      .sort((a, b) => b.date.localeCompare(a.date));
    const latest = withWinners[0];
    return latest
      ? { tournament: latest, list: winners.filter((w) => w.tournamentId === latest.id) }
      : null;
  })();

  return (
    <section
      id="tournaments"
      aria-labelledby="tournaments-title"
      className="on-dark relative overflow-x-clip text-alba-paper"
      style={{
        background:
          // A deliberate step into the arena: blue holds briefly, the night closes in
          // over a short band, then the lower chapter is the arena. Not a slow drift.
          "linear-gradient(to bottom, var(--alba-blue) 0%, var(--alba-blue) 3%, var(--alba-night) 13%, var(--alba-night) 100%)",
      }}
    >
      {/* The white chapters give way to the arena along the card wave. */}
      <Wave fill="var(--alba-paper)" flip className="-mt-px" />

      <div className="shell pb-[calc(clamp(9rem,20vw,18rem)+clamp(2.5rem,5vw,4rem))] pt-[clamp(2rem,5vw,4rem)]">
        <Reveal>
          <h2
            id="tournaments-title"
            className="display-xl text-[clamp(4.5rem,15.5vw,14rem)] leading-[0.8] lg:text-[clamp(7rem,12.2vw,13rem)]"
          >
            <span className="keep block">{t("tour.title1")}</span>
            <span className="keep block text-alba-gold">{t("tour.title2")}</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-4 lg:pt-6">
            <p className="type-lede max-w-[26ch] text-alba-paper/90">{t("tour.body")}</p>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7 lg:-mt-[clamp(6rem,10vw,10rem)]">
            {featured && phase ? (
              <ArenaFixture tournament={featured} now={now} />
            ) : (
              <p className="text-xl">{t("tour.none")}</p>
            )}
            <div className="mt-12">
              <PrizeLadder />
            </div>
          </div>
        </div>

        {/* Champions — verified records only; the block disappears if there are none.
            Bottom padding = the Physical Cards product rise + air, so the rising
            box can never cover the carousel controls. */}
        {champions ? (
          <div className="mt-[clamp(5rem,9vw,8rem)] border-t border-alba-paper/15 pt-[clamp(3rem,6vw,5rem)]">
            <Reveal>
              <p className="label text-alba-gold">{t("arena.proof")}</p>
              <h3 className="display-xl type-editorial">
                <span className="block sm:inline">{t("win.title1")}</span>{" "}
                <span className="block sm:inline">{t("win.title2")}</span>
              </h3>
              <p className="label mt-4 text-alba-paper/85">
                {t("tour.numbered", { n: champions.tournament.number })}
                {", "}
                {formatTournamentDate(champions.tournament, lang)}
              </p>
            </Reveal>
            <div className="champ-stage relative mt-10">
              {beatsMode ? (
                <ChampionsBeats tournament={champions.tournament} winners={champions.list} />
              ) : (
                <ChampionsCarousel tournament={champions.tournament} winners={champions.list} />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
