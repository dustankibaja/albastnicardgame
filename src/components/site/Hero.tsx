import { useRef } from "react";
import { CardsButton } from "./CardsButton";
import { DownloadButton } from "./DownloadButton";
import { PhoneMockup } from "./PhoneMockup";
import { Picture } from "./Picture";
import { Wave } from "./Wave";
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
  dx: number;
  dy: number;
  dr: number;
  delay: number;
};

const cards: Layer[] = [
  {
    id: "aceRed",
    alt: "alt.aceRed",
    box: "left-[3%] top-[22%] w-[30%] lg:left-[2%] lg:top-[30%] lg:w-[29%]",
    rotate: -15,
    dx: 6,
    dy: 40,
    dr: -3,
    delay: 140,
  },
  {
    id: "aceBlack",
    alt: "alt.aceBlack",
    box: "left-[15%] top-[10%] w-[30%] lg:left-[20%] lg:top-[19%] lg:w-[29%]",
    rotate: -4,
    dx: 10,
    dy: 60,
    dr: -1.5,
    delay: 220,
  },
  {
    id: "aceBlue",
    alt: "alt.aceBlue",
    box: "left-[64%] top-[18%] w-[30%] lg:left-[38%] lg:top-[26%] lg:w-[29%]",
    rotate: 9,
    dx: 14,
    dy: 50,
    dr: 2,
    delay: 300,
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
      <div className="shell relative z-10 grid items-center gap-4 pb-[clamp(2.5rem,7vw,7rem)] lg:gap-6 pt-24 sm:pt-28 lg:grid-cols-12 lg:pt-32">
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
          <div className="relative mx-auto aspect-[1/0.9] w-full max-w-[560px] lg:aspect-[1/0.78] lg:max-w-none">
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
                    className="overflow-hidden rounded-[7%] shadow-[0_30px_50px_-18px_rgb(0_0_0/0.65)]"
                    style={{ transform: `rotate(${c.rotate}deg)` }}
                  />
                </div>
              </div>
            ))}

            {/* Phone: centred on mobile, overlapping the hand on desktop. */}
            <div
              className="depth absolute left-[29%] top-0 z-10 w-[42%] lg:left-[64%] lg:top-[2%] lg:w-[31%]"
              style={depthVars(18, 90, 1.5)}
            >
              <div className="enter" style={{ ["--delay" as string]: "260ms" }}>
                <PhoneMockup
                  alt={t("alt.app")}
                  priority
                  sizes="(min-width: 1024px) 18vw, 42vw"
                  className="rotate-[4deg]"
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

      {/* Card-wave edge into the white "card stock" chapter. */}
      <Wave fill="var(--alba-paper)" className="relative z-0 -mb-px -mt-[clamp(44px,7vw,120px)]" />
    </section>
  );
}

function depthVars(dx: number, dy: number, dr: number) {
  return { ["--dx" as string]: dx, ["--dy" as string]: dy, ["--dr" as string]: dr };
}
