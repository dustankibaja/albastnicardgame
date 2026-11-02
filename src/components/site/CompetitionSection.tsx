import { useEffect, useState } from "react";
import { AlbaButton } from "./AlbaButton";
import { DownloadButton } from "./DownloadButton";
import { Reveal } from "./Reveal";
import { TournamentCountdown } from "./TournamentCountdown";
import { WinnerCard } from "./WinnerCard";
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
  const { t } = useI18n();
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

  const ranked = [...winners].sort((a, b) => a.position - b.position);

  return (
    <section id="tournaments" aria-labelledby="tournaments-title">
      {/* Tournament */}
      <div className="on-dark bg-alba-blue py-20 text-alba-paper lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <p className="eyebrow text-alba-paper/90">{t("tour.eyebrow")}</p>
            <h2 id="tournaments-title" className="display-xl mt-4 text-4xl sm:text-5xl lg:text-6xl">
              {t("tour.title")}
            </h2>
            <p className="mt-5 max-w-md text-lg text-alba-paper/90">{t("tour.body")}</p>
          </Reveal>

          <Reveal delay={120}>
            {featured && phase ? (
              <TournamentPanel tournament={featured} phase={phase} now={now} />
            ) : (
              <div className="rounded-3xl bg-alba-ink p-6 sm:p-8">
                <p className="text-lg">{t("tour.none")}</p>
              </div>
            )}
          </Reveal>
        </div>
      </div>

      {/* Winners — only verified records. Hidden entirely if there are none. */}
      {ranked.length > 0 ? (
        <div className="py-20 lg:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-muted-foreground">{t("win.eyebrow")}</p>
              <h3 className="display-xl mt-4 text-4xl leading-[0.9] sm:text-5xl lg:text-6xl">
                {t("win.title")}
              </h3>
            </Reveal>
            <ol className="mt-12 grid max-w-[1100px] gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ranked.map((w, i) => (
                <Reveal as="li" key={w.id} delay={i * 90}>
                  <WinnerCard winner={w} featured={w.position === 1} />
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TournamentPanel({
  tournament,
  phase,
  now,
}: {
  tournament: Tournament;
  phase: "upcoming" | "live" | "ended" | "cancelled";
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
  const detailsMissing = !tournament.startAt || !tournament.mode;

  return (
    <div className="grid gap-5">
      <div className="rounded-3xl bg-alba-ink p-6 sm:p-8">
        <p className="eyebrow text-alba-gold">
          {phase === "live" ? t("tour.live") : phase === "ended" ? t("tour.ended") : t("tour.next")}
        </p>
        <h3 className="display-xl mt-3 text-3xl">{heading}</h3>
        <ul className="mt-4 grid gap-1 text-lg">
          {named ? <li>{date}</li> : null}
          {time ? <li>{t("tour.timeTz", { time })}</li> : null}
          {modeKey ? <li>{t(modeKey)}</li> : null}
          {tournament.location ? <li>{tournament.location}</li> : null}
        </ul>
        {detailsMissing ? <p className="mt-4 text-alba-paper/90">{t("tour.detailsSoon")}</p> : null}
      </div>

      {phase === "upcoming" && tournament.startAt ? (
        <TournamentCountdown target={Date.parse(tournament.startAt)} now={now} />
      ) : null}

      <div>
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
