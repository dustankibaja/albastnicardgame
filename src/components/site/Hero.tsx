import { useRef } from "react";
import { CardsButton } from "./CardsButton";
import { DownloadButton } from "./DownloadButton";
import { PhoneMockup } from "./PhoneMockup";
import { Picture } from "./Picture";
import type { SiteImageId } from "@/content/assets";
import { usePointerDepth, useScrollProgress } from "@/hooks/use-depth";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * Hero: TWO WAYS TO PLAY. ONE ALBASTINI.
 * Physical cards and the real app share one stage. Objects sit in depth
 * layers (scroll + gentle pointer response on desktop); the inner element
 * carries the page-load entrance so the two transforms never fight.
 */

type Layer = {
  id: SiteImageId;
  alt: TKey;
  /** position/size inside the stage, mobile first then desktop */
  box: string;
  rotate: number;
  /** depth: farther cards are slightly smaller, softer shadow, slower parallax */
  scale: number;
  shadow: string;
  dx: number;
  dy: number;
  dr: number;
  delay: number;
};

/*
 * A held hand, not a row: heavy overlap, uneven rotations, three depths.
 * Back → front: red, black, blue. Each card keeps its visible artwork
 * (corner index + chip) unobscured enough to read; the phone overlaps the
 * front card's edge so both experiences share one stage.
 */
const cards: Layer[] = [
  {
    id: "aceRed",
    alt: "alt.aceRed",
    box: "left-[0%] top-[25%] w-[31%] lg:left-[1%] lg:top-[29%] lg:w-[30%]",
    rotate: -19,
    scale: 0.93,
    shadow: "shadow-[0_18px_30px_-16px_rgb(0_0_0/0.5)]",
    dx: 5,
    dy: 30,
    dr: -2,
    delay: 140,
  },
  {
    id: "aceBlack",
    alt: "alt.aceBlack",
    box: "left-[11%] top-[13%] w-[31%] lg:left-[13%] lg:top-[18%] lg:w-[30%]",
    rotate: -7,
    scale: 0.97,
    shadow: "shadow-[0_24px_40px_-18px_rgb(0_0_0/0.55)]",
    dx: 9,
    dy: 48,
    dr: -1,
    delay: 210,
  },
  {
    id: "aceBlue",
    alt: "alt.aceBlue",
    box: "left-[57%] top-[21%] w-[31%] lg:left-[26%] lg:top-[24%] lg:w-[30%]",
    rotate: 6,
    scale: 1,
    shadow: "shadow-[0_34px_54px_-20px_rgb(0_0_0/0.65)]",
    dx: 13,
    dy: 64,
    dr: 1.5,
    delay: 280,
  },
];

export function Hero() {
  const { t } = useI18n();
  const stage = useRef<HTMLElement>(null);
  useScrollProgress(stage);
  usePointerDepth(stage);

  return (
    <section
      id="top"
      ref={stage}
      aria-labelledby="hero-title"
      className="on-dark relative isolate overflow-hidden bg-alba-blue text-alba-paper"
    >
      <div className="shell relative z-10 grid items-center gap-4 pb-[clamp(0.75rem,1.5vw,1.5rem)] lg:gap-6 pt-24 sm:pt-28 lg:grid-cols-12 lg:pt-32">
        <div className="lg:col-span-5">
          <h1 id="hero-title" className="display-xl">
            <span className="enter block text-[clamp(4.25rem,19vw,10rem)] lg:text-[clamp(5.5rem,8.6vw,9.75rem)]">
              <span className="block whitespace-nowrap">{t("hero.title1")}</span>
              <span className="block whitespace-nowrap">{t("hero.title2")}</span>
            </span>
            <span
              className="enter mt-3 block text-[clamp(2.4rem,10.5vw,5.75rem)] text-alba-gold lg:text-[clamp(3rem,5.6vw,5.75rem)]"
              style={{ ["--delay" as string]: "80ms" }}
            >
              {t("hero.one")}
            </span>
          </h1>
          <p
            className="enter mt-6 max-w-[28ch] text-xl leading-snug text-alba-paper/90 sm:text-2xl"
            style={{ ["--delay" as string]: "140ms" }}
          >
            {t("hero.sub")}
          </p>
          <div
            className="enter mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ ["--delay" as string]: "180ms" }}
          >
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
            <CardsButton size="lg" className="w-full sm:w-auto">
              {t("cta.cards")}
            </CardsButton>
          </div>
        </div>

        {/* The stage: physical cards and the app, together. */}
        <div className="relative lg:col-span-7">
          <div className="relative mx-auto aspect-[1/0.98] w-full max-w-[560px] lg:aspect-[1/0.78] lg:max-w-none">
            {cards.map((c) => (
              <div
                key={c.id}
                className={cn("depth absolute", c.box)}
                style={depthVars(c.dx, c.dy, c.dr)}
              >
                <div className="enter" style={{ ["--delay" as string]: `${c.delay}ms` }}>
                  <Picture
                    id={c.id}
                    alt={t(c.alt)}
                    priority
                    sizes="(min-width: 1024px) 18vw, 31vw"
                    className={cn("overflow-hidden rounded-[7%]", c.shadow)}
                    style={{ transform: `rotate(${c.rotate}deg) scale(${c.scale})` }}
                  />
                </div>
              </div>
            ))}

            {/* Phone: centred on mobile, overlapping the hand on desktop. */}
            <div
              className="depth absolute left-[27%] top-0 z-10 w-[46%] lg:left-[49%] lg:top-[0%] lg:w-[37%]"
              style={depthVars(20, 96, 1.5)}
            >
              <div className="enter" style={{ ["--delay" as string]: "260ms" }}>
                <PhoneMockup
                  alt={t("alt.app")}
                  priority
                  sizes="(min-width: 1024px) 22vw, 46vw"
                  className="rotate-[5deg]"
                />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-2 flex max-w-[560px] justify-between lg:max-w-none lg:px-[2%]">
            <p className="label">
              <span className="text-alba-gold">01</span> {t("hero.physical")}
            </p>
            <p className="label lg:mr-[4%]">
              <span className="text-alba-gold">02</span> {t("hero.digital")}
            </p>
          </div>
        </div>
      </div>
      {/* The wave edge now belongs to the next chapter: the hero blue flows
          straight onto the real table photograph (Phase 4). */}
    </section>
  );
}

function depthVars(dx: number, dy: number, dr: number) {
  return { ["--dx" as string]: dx, ["--dy" as string]: dy, ["--dr" as string]: dr };
}
