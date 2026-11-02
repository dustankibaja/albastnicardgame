import { useRef } from "react";
import { CardHand, type HandCard } from "./CardHand";
import { CardsButton } from "./CardsButton";
import { PhoneMockup } from "./PhoneMockup";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { Wave } from "./Wave";
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
 *  4. The genuine table photo is the strip behind the headline (Phase 4).
 *  5. When a cleared community photo exists it appears as a glimpse
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
  // Only cleared community photography may appear here; the slot is empty.
  const glimpse = hasImage("communityPlay") ? "communityPlay" : null;

  return (
    <section
      id="play"
      aria-labelledby="play-title"
      className="relative overflow-x-clip bg-alba-paper text-alba-ink"
    >
      {/*
        FROM THE TABLE: a real table. Genuine photo of Albastini cards on a
        wooden table as a strip behind the headline; its lower edge becomes the
        card-wave, and the interactive hand rests on it.
      */}
      <div className="relative isolate overflow-hidden">
        <Picture
          id="cardsOnTable"
          alt={t("alt.table")}
          sizes="100vw"
          className="absolute inset-0 -z-10"
          imgClassName="h-full w-full object-cover object-[46%_58%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.86)_0%,rgb(0_0_0/0.8)_55%,rgb(0_0_0/0.42)_100%)]"
        />
        <div className="shell pb-[clamp(4.5rem,10vw,8.5rem)] pt-[calc(clamp(44px,7vw,120px)+clamp(1.25rem,3vw,2.25rem))]">
          <Reveal>
            <h2 id="play-title" className="display-xl type-headline text-alba-paper">
              <span className="block sm:inline">{t("two.title1")}</span>{" "}
              <span className="block text-alba-gold sm:inline">{t("two.title2")}</span>
            </h2>
          </Reveal>
        </div>
        {/* Hero blue hangs over the table along the card-wave… */}
        <Wave fill="var(--alba-blue)" flip className="absolute inset-x-0 top-0 -mt-px" />
        {/* …and the table gives way to the white "card stock" along it again. */}
        <Wave fill="var(--alba-paper)" className="absolute inset-x-0 bottom-0 -mb-px" />
      </div>

      <div className="shell relative z-10 -mt-[clamp(3rem,5vw,4.5rem)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
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
