import { useRef } from "react";
import { CardHand, type HandCard } from "./CardHand";
import { CardsButton } from "./CardsButton";
import { DownloadButton } from "./DownloadButton";
import { PhoneMockup } from "./PhoneMockup";
import { Reveal } from "./Reveal";
import { useScrollProgress } from "@/hooks/use-depth";
import { useI18n } from "@/lib/i18n";

/*
 * FROM THE TABLE. TO THE SCREEN.
 * One composition: the hand of real cards (physical, interactive) on white
 * card stock, crossing to the phone sitting on a card-wave band (digital).
 * The north-star words (play, friendship, competition) are the card tabs.
 */

const hand: HandCard[] = [
  {
    id: "aceRed",
    alt: "alt.aceRed",
    title: "two.play.t",
    body: "two.play.b",
    tone: "text-alba-red",
    rotate: -8,
  },
  {
    id: "aceBlack",
    alt: "alt.aceBlack",
    title: "two.friends.t",
    body: "two.friends.b",
    tone: "text-alba-ink",
    rotate: 0,
  },
  {
    id: "aceBlue",
    alt: "alt.aceBlue",
    title: "two.compete.t",
    body: "two.compete.b",
    tone: "text-alba-blue",
    rotate: 8,
  },
];

export function TwoWaysSection() {
  const { t } = useI18n();
  const band = useRef<HTMLDivElement>(null);
  useScrollProgress(band);

  return (
    <section
      id="play"
      aria-labelledby="play-title"
      className="relative overflow-x-clip bg-alba-paper pb-[clamp(3rem,7vw,6rem)] pt-[clamp(2rem,5vw,4rem)] text-alba-ink"
    >
      <div className="shell">
        <Reveal>
          <h2 id="play-title" className="display-xl text-[clamp(3.5rem,11vw,9.5rem)]">
            {t("two.title1")}
            <span className="sr-only"> {t("two.title2")}</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-16 lg:mt-14 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-7 lg:pr-8">
            <CardHand cards={hand} label="two.tabs" />
            <div className="mt-10">
              <CardsButton size="lg" className="w-full sm:w-auto">
                {t("cta.cards")}
              </CardsButton>
            </div>
          </div>

          {/* Digital: phone on a band shaped like the card wave. */}
          <div ref={band} className="relative lg:col-span-5">
            <svg
              aria-hidden
              viewBox="0 0 800 320"
              preserveAspectRatio="none"
              className="absolute -left-[6%] top-[40%] h-[44%] w-[calc(112%+var(--gutter))] -translate-y-1/2 max-lg:left-[calc(-1*var(--gutter))] max-lg:w-[calc(100%+2*var(--gutter))]"
            >
              <path
                d="M0 96 C 180 20, 380 16, 560 70 S 760 120, 800 92 L 800 238 C 640 300, 420 196, 230 232 S 40 268, 0 250 Z"
                fill="var(--alba-blue)"
              />
            </svg>
            <div
              className="depth relative mx-auto w-[56%] max-w-[260px]"
              style={{ ["--dy" as string]: 36, ["--dr" as string]: 1.5 }}
            >
              <PhoneMockup
                alt={t("alt.app")}
                sizes="(min-width: 1024px) 270px, 58vw"
                className="-rotate-3"
              />
            </div>
            <p className="label relative mt-6 text-center">{t("two.app")}</p>
            <div className="relative mt-5 flex justify-center">
              <DownloadButton size="lg" className="w-full sm:w-auto">
                {t("cta.app")}
              </DownloadButton>
            </div>
          </div>
        </div>

        <Reveal className="mt-12 lg:-mt-4">
          <p
            aria-hidden="true"
            className="display-xl text-right text-[clamp(3.5rem,11vw,9.5rem)] text-alba-blue"
          >
            {t("two.title2")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
