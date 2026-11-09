import { AlbaButton } from "./AlbaButton";
import { DownloadButton } from "./DownloadButton";
import { TournamentCountdown } from "./TournamentCountdown";
import { Numeral } from "./Numeral";
import { Reveal } from "./Reveal";
import { tournamentPrizeStructure, formatPrize } from "@/content/winners";
import type { Tournament } from "@/content/tournaments";
import { formatTournamentDate, getTournamentPhase } from "@/lib/tournament";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * ARENA — the Competition fixture composition. No box: the arena is the
 * container. Order of information: tournament number, date, registration,
 * prize ladder, CTA. The giant 27 is environmental, behind the fixture.
 *
 * Only verified data is used. The start time is never invented: the line
 * reads "to be announced" until a time is verified in the content.
 */
export function ArenaFixture({ tournament, now }: { tournament: Tournament; now: number }) {
  const { t, lang } = useI18n();
  const phase = getTournamentPhase(tournament, now);
  const date = formatTournamentDate(tournament, lang);
  const postponed = phase === "postponed";
  // Countdown only for a VERIFIED start time while the event is upcoming.
  const showCountdown = phase === "upcoming" && Boolean(tournament.startAt);

  return (
    <div className="arena-fixture relative">
      {/* environmental 27: outlined, partly off the right edge, behind the copy */}
      <div className="arena-27" aria-hidden="true">
        <Numeral role="event" outline>
          {String(tournament.number)}
        </Numeral>
      </div>

      <Reveal className="relative z-10">
        <p className="label text-alba-gold">{t("arena.nextLabel")}</p>
        <p className="num-date keep mt-3 text-alba-paper">
          {postponed ? t("tour.postponed") : date}
        </p>
        {!postponed && !tournament.startAt ? (
          <p className="mt-2 text-lg text-alba-paper/85">{t("arena.startTbc")}</p>
        ) : null}
        <p className="mt-4 text-lg text-alba-paper/90">{t("tour.registerApp")}</p>
        {showCountdown && tournament.startAt ? (
          <div className="mt-6 max-w-md">
            <TournamentCountdown target={Date.parse(tournament.startAt)} now={now} />
          </div>
        ) : null}
        <div className="mt-8">
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
      </Reveal>
    </div>
  );
}

/*
 * PRIZE LADDER — ranking, not a financial chart. Bars are proportional to the
 * recurring structure (100% / 50% / 20%), read from the one prize source.
 * SLIDE extends each rank line; SETTLE lands the value. Reduced motion shows
 * the full ladder at once.
 */
export function PrizeLadder() {
  const { t } = useI18n();
  const first = tournamentPrizeStructure[1];
  const rows = ([1, 2, 3] as const).map((place) => ({
    place,
    amount: tournamentPrizeStructure[place],
    pct: Math.round((tournamentPrizeStructure[place] / first) * 100),
  }));

  return (
    <ol className="prize-ladder" aria-label={t("arena.prizeLabel")}>
      {rows.map((r, i) => (
        <li
          key={r.place}
          className={cn("prize-row", `prize-row--${r.place}`)}
          style={{ ["--i" as string]: i }}
        >
          <span className="prize-rank" aria-hidden="true">
            <Numeral role="rank" outline>
              {String(r.place).padStart(2, "0")}
            </Numeral>
          </span>
          <span
            className="prize-line"
            style={{ ["--pct" as string]: `${r.pct}%` }}
            aria-hidden="true"
          />
          <span className="prize-value">
            <Numeral role="prize" unit="TSH">
              {formatPrize(r.amount).replace(" TSH", "")}
            </Numeral>
          </span>
        </li>
      ))}
    </ol>
  );
}
