import { useRef } from "react";
import { CardsButton } from "./CardsButton";
import { DownloadButton } from "./DownloadButton";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { useScrollProgress } from "@/hooks/use-depth";
import { useI18n } from "@/lib/i18n";

/*
 * The ending: the whole hand of Albastini cards (brand artwork) rises out
 * of the white table into the dark, partially cropped by the page edge.
 */
export function FinalCTA() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref);

  return (
    <section
      ref={ref}
      aria-labelledby="final-title"
      className="on-dark relative z-10 overflow-x-clip bg-alba-ink text-alba-paper"
    >
      <div
        aria-hidden
        className="depth pointer-events-none absolute -right-[18%] -top-[clamp(5rem,12vw,10rem)] w-[min(66vw,520px)] sm:-right-[6%]"
        style={{ ["--dy" as string]: -50, ["--dr" as string]: -3 }}
      >
        <Picture
          id="cardFan"
          alt=""
          sizes="(min-width: 640px) 520px, 66vw"
          className="rotate-[8deg]"
        />
      </div>

      <div className="shell relative pb-[clamp(5rem,10vw,8rem)] pt-[clamp(15rem,62vw,17rem)] sm:pt-[clamp(8rem,14vw,12rem)]">
        <Reveal className="max-w-3xl">
          <h2 id="final-title" className="display-xl type-poster">
            {t("final.title1")}
            <br />
            {t("final.title2")}
          </h2>
          <p className="display-xl mt-8 text-[clamp(2rem,5vw,3.75rem)] text-alba-gold">
            {t("brand.tagline")}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
            <CardsButton size="lg" className="w-full sm:w-auto">
              {t("cta.cards")}
            </CardsButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
