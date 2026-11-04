import { useEffect, useState } from "react";
import { AlbaButton } from "./AlbaButton";
import { DownloadButton } from "./DownloadButton";
import { Reveal } from "./Reveal";
import { TournamentCountdown } from "./TournamentCountdown";
import { ChampionsCarousel } from "./ChampionsCarousel";
import { Wave } from "./Wave";
import { tournaments, type Tournament } from "@/content/tournaments";
import { winners } from "@/content/winners";
import { useI18n } from "@/lib/i18n";
import {
  formatTournamentDate,
  formatTournamentTime,
  getFeaturedTournament,
  getTournamentPhase,
} from "@/lib/tournament";

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
          "linear-gradient(to bottom, var(--alba-blue) 0%, var(--alba-blue) 28%, var(--alba-night) 72%, var(--alba-night) 100%)",
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
          <Reveal
            delay={100}
            className="lg:col-span-6 lg:col-start-7 lg:-mt-[clamp(10rem,16vw,15rem)] xl:col-span-5 xl:col-start-8"
          >
            {featured && phase ? (
              <TournamentPanel tournament={featured} phase={phase} now={now} />
            ) : (
              <div className="rounded-[1.75rem] bg-alba-ink p-8">
                <p className="text-xl">{t("tour.none")}</p>
              </div>
            )}
          </Reveal>
        </div>

        {/* Champions — verified records only; the block disappears if there are none.
            Bottom padding = the Physical Cards product rise + air, so the rising
            box can never cover the carousel controls. */}
        {champions ? (
          <div className="mt-[clamp(5rem,9vw,8rem)] border-t border-alba-paper/15 pt-[clamp(3rem,6vw,5rem)]">
            <Reveal>
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
            <div className="mt-10">
              <ChampionsCarousel tournament={champions.tournament} winners={champions.list} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TournamentPanel({
  tournament,
  phase,
  now,
}: {
  tournament: Tournament;
  phase: "upcoming" | "live" | "ended" | "postponed" | "cancelled";
  now: number;
}) {
  const { t, lang } = useI18n();
  const date = formatTournamentDate(tournament, lang);
  // Without a verified number or title, the date itself is the heading
  // (avoids repeating "Next tournament" in both the label and the heading).
  const named =
    tournament.title ?? (tournament.number ? t("tour.numbered", { n: tournament.number }) : null);
  const heading = named ?? date;
  const time = formatTournamentTime(tournament, lang);
  const modeKey = tournament.mode ? (`tour.mode.${tournament.mode}` as const) : null;

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-alba-ink">
      <div className="p-7 sm:p-10">
        <p className="label text-alba-gold">
          {phase === "live" ? t("tour.live") : phase === "ended" ? t("tour.ended") : t("tour.next")}
        </p>
        <h3 className="display-xl mt-3 text-[clamp(1.85rem,9.2vw,3.75rem)] text-alba-paper lg:text-[clamp(2.5rem,3.4vw,3.75rem)]">
          {named ? heading : <DateHeading text={heading} />}
        </h3>
        <ul className="mt-4 grid gap-1 text-xl">
          {/* While postponed with no new date, the old date must not read as current. */}
          {named && phase !== "postponed" ? <li>{date}</li> : null}
          {time ? <li>{t("tour.timeTz", { time })}</li> : null}
          {modeKey ? <li>{t(modeKey)}</li> : null}
          {tournament.location ? <li>{tournament.location}</li> : null}
        </ul>
        <ul className="mt-5 grid gap-1 text-lg text-alba-paper/85">
          {tournament.registration === "app" ? <li>{t("tour.registerApp")}</li> : null}
          {phase === "postponed" ? <li>{t("tour.postponed")}</li> : null}
          {!tournament.startAt && phase !== "postponed" ? <li>{t("tour.timeTba")}</li> : null}
        </ul>
      </div>

      {phase === "upcoming" && tournament.startAt ? (
        <div className="border-t border-alba-paper/15 px-3 pb-3 sm:px-5 sm:pb-5">
          <TournamentCountdown target={Date.parse(tournament.startAt)} now={now} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-alba-paper/15 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        {tournament.registrationUrl ? (
          <AlbaButton asChildHref={tournament.registrationUrl} size="lg">
            {t("cta.playApp")}
          </AlbaButton>
        ) : (
          <DownloadButton size="lg" className="w-full sm:w-auto">
            {t("cta.playApp")}
          </DownloadButton>
        )}
      </div>
    </div>
  );
}

/** "Saturday, 21 November 2026" → weekday line + the date kept whole. */
function DateHeading({ text }: { text: string }) {
  const i = text.indexOf(", ");
  if (i < 0) return <span className="keep">{text}</span>;
  return (
    <>
      <span className="block">{text.slice(0, i + 1)}</span>
      <span className="keep block">{text.slice(i + 2)}</span>
    </>
  );
}
