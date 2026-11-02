import { useRef } from "react";
import { CardHand, type HandCard } from "./CardHand";
import { CardsButton } from "./CardsButton";
import { PhoneMockup } from "./PhoneMockup";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { hasImage } from "@/content/assets";
import { useScrollProgress } from "@/hooks/use-depth";
import { useI18n } from "@/lib/i18n";

/*
 * FROM THE TABLE. TO THE SCREEN. — one sentence unfolding.
 *  1. The sentence is set as one headline (second half in brand blue).
 *  2. Left: the hand of cards (physical), its copy beside it. Quiet scale.
 *  3. A full-width card-wave band closes the chapter; the phone rises out
 *     of it on the right (partial device: only the upper screen shows, so it
 *     differs from the hero's full phone).
 *  4. When a cleared "real play" photo exists it appears as a glimpse
 *     beside the hand; until then nothing is rendered there.
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
  const stage = useRef<HTMLDivElement>(null);
  useScrollProgress(stage);
  const glimpse = hasImage("communityPlay")
    ? "communityPlay"
    : hasImage("cardsOnTable")
      ? "cardsOnTable"
      : null;

  return (
    <section
      id="play"
      aria-labelledby="play-title"
      className="relative overflow-x-clip bg-alba-paper pt-[clamp(1.5rem,4vw,3rem)] text-alba-ink"
    >
      <div className="shell">
        <Reveal>
          <h2 id="play-title" className="display-xl type-headline">
            <span className="block sm:inline">{t("two.title1")}</span>{" "}
            <span className="block text-alba-blue sm:inline">{t("two.title2")}</span>
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <CardHand cards={hand} label="two.tabs" />
            <div className="mt-6">
              <CardsButton size="md" className="w-full sm:w-auto">
                {t("cta.cards")}
              </CardsButton>
            </div>
            {glimpse ? (
              <Picture
                id={glimpse}
                alt=""
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="mt-8 overflow-hidden rounded-2xl"
              />
            ) : null}
          </div>
          {/* spacer column: the phone lives in the band below on large screens */}
          <div className="hidden lg:col-span-4 lg:block" />
        </div>
      </div>

      {/* The band: table → screen. Phone rises out of it (partial device). */}
      <div ref={stage} className="relative mt-[clamp(-14rem,-17vw,-4rem)] max-lg:mt-10">
        <div
          className="depth relative z-10 mx-auto w-[min(62vw,280px)] lg:ml-[78%] lg:mr-0 lg:w-[min(19vw,290px)] xl:ml-[70%]"
          style={{ ["--dy" as string]: 28 }}
        >
          <div className="h-[clamp(15rem,52vw,20rem)] overflow-hidden lg:h-[clamp(17rem,24vw,22rem)]">
            <PhoneMockup
              alt={t("alt.app")}
              sizes="(min-width: 1024px) 300px, 62vw"
              className="-rotate-2"
            />
          </div>
        </div>
        <svg
          aria-hidden
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="relative z-20 -mt-[clamp(3rem,6vw,5.5rem)] block h-[clamp(5rem,9vw,9rem)] w-full"
        >
          <path
            d="M0 70 C 240 10, 480 0, 720 44 S 1180 118, 1440 46 L 1440 160 L 0 160 Z"
            fill="var(--alba-blue)"
          />
        </svg>
        <div className="relative z-20 -mt-px bg-alba-blue pb-5 text-alba-paper">
          <p className="label mx-auto w-[min(62vw,280px)] text-center lg:ml-[78%] lg:mr-0 lg:w-[min(19vw,290px)] xl:ml-[70%]">
            {t("two.app")}
          </p>
        </div>
      </div>
    </section>
  );
}
