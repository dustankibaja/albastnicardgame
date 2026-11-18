import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { Picture } from "./Picture";
import { useDownload } from "./DownloadModal";
import { appStoreLinks } from "@/content/links";
import { winnerPrize } from "@/content/winners";
import "./hall.css";
import { ArenaFixture, PrizeLadder } from "./Arena";
import { Numeral } from "./Numeral";
import { Wave } from "./Wave";
import type { Tournament } from "@/content/tournaments";
import type { Winner } from "@/content/winners";
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
export function CompetitionSection({
  renderedAt,
  tournaments,
  winners,
  countdownEnabled,
}: {
  renderedAt: number;
  tournaments: Tournament[];
  winners: Winner[];
  countdownEnabled: boolean;
}) {
  const { t, lang } = useI18n();
  const [now, setNow] = useState(renderedAt);
  const { openDownload } = useDownload();
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
              <ArenaFixture tournament={featured} now={now} countdownEnabled={countdownEnabled} />
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
          <section className="hall" aria-labelledby="hall-title">
            <span className="hall-water" aria-hidden="true">
              {champions.tournament.number}
            </span>
            <header>
              <div>
                <small>Albastini · {t("tour.numbered", { n: champions.tournament.number })}</small>
                <h3 id="hall-title">
                  {lang === "sw" ? "Ukumbi wa" : "Hall of"}
                  <br />
                  {lang === "sw" ? "Mabingwa" : "Champions"}
                </h3>
              </div>
              <p>
                {formatTournamentDate(champions.tournament, lang)}
                <br />
                {champions.list.length === 3
                  ? lang === "sw"
                    ? "Wachezaji watatu. Meza moja."
                    : "Three players. One table."
                  : null}
              </p>
            </header>
            <div className="hall-podium">
              {champions.list.map((w) => (
                <article key={w.id} data-rank={w.placement} className="hall-card">
                  <div className="hall-photo">
                    {w.portraitUrl ? (
                      <img src={w.portraitUrl} alt={w.displayName} loading="lazy" />
                    ) : w.portrait ? (
                      <Picture
                        id={w.portrait}
                        alt={w.displayName}
                        sizes="(max-width:700px) 85vw, 30vw"
                      />
                    ) : null}
                    <b
                      className="hall-rank"
                      aria-label={t(
                        w.placement === 1 ? "win.p1" : w.placement === 2 ? "win.p2" : "win.p3",
                      )}
                    >
                      {w.placement}
                      <i>♦</i>
                    </b>
                    {w.placement === 1 && (
                      <strong className="hall-badge">
                        {lang === "sw" ? "Bingwa" : "Champion"}
                      </strong>
                    )}
                  </div>
                  <div className="hall-caption">
                    <div>
                      <h4>{w.displayName}</h4>
                      <p>{w.location}</p>
                    </div>
                    <b>
                      {winnerPrize(w).toLocaleString("en-US")}
                      <small>TSH</small>
                    </b>
                  </div>
                </article>
              ))}
            </div>
            {featured?.status === "upcoming" && (
              <footer>
                <div>
                  <small>{lang === "sw" ? "Inayofuata" : "Next up"}</small>
                  <h4>
                    {t("tour.numbered", { n: featured.number })} ·{" "}
                    {formatTournamentDate(featured, lang)}{" "}
                    {featured.startAt &&
                      new Intl.DateTimeFormat(lang === "sw" ? "sw-TZ" : "en-US", {
                        timeZone: "Africa/Dar_es_Salaam",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(featured.startAt))}{" "}
                    EAT
                  </h4>
                </div>
                {featured.registrationUrl ? (
                  <a href={featured.registrationUrl}>{lang === "sw" ? "Jisajili" : "Register"}</a>
                ) : (
                  <button type="button" onClick={takeSeat}>
                    {lang === "sw" ? "Jisajili kwenye app" : "Take your seat. Register in the app"}
                  </button>
                )}
              </footer>
            )}
          </section>
        ) : (
          <div className="mt-16">
            <h3 className="display-xl">
              {t("win.title1")} {t("win.title2")}
            </h3>
            <p>
              {lang === "sw"
                ? "Matokeo yataonekana hapa yakichapishwa."
                : "Tournament results will appear here when published."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
