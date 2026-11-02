import { useRef } from "react";
import { DownloadButton } from "./DownloadButton";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { Wave } from "./Wave";
import { useScrollProgress } from "@/hooks/use-depth";
import { useI18n } from "@/lib/i18n";

/*
 * How to Play — medium volume. No rules, video or tutorial steps are
 * invented: the two steps are navigation facts.
 *
 * Distinct app treatment: a tight interface crop (no phone frame) of the
 * genuine screenshot, framed on the real How to Play control.
 * Geometry in app-home-public.webp (500×899): How to Play spans
 * x 6–93.2%, y 65.2–73.6%. The window shows y 55–76.5% (Tournament + How to
 * Play). Display width is capped at 340px: the 500px source goes soft beyond
 * that on high-density screens. Needs a higher-resolution screenshot to grow.
 */
const WIN = { top: 0.55, bottom: 0.765 };
const BTN = { x: 6, w: 87.2, top: 0.652, bottom: 0.736 };

export function HowToPlaySection() {
  const { t } = useI18n();
  const zone = useRef<HTMLDivElement>(null);
  useScrollProgress(zone);

  const span = WIN.bottom - WIN.top;
  const ringTop = ((BTN.top - WIN.top) / span) * 100;
  const ringH = ((BTN.bottom - BTN.top) / span) * 100;

  return (
    <section
      id="how-to-play"
      aria-labelledby="how-title"
      className="relative overflow-x-clip bg-alba-paper text-alba-ink"
    >
      {/* closes the blue band from the previous chapter */}
      <Wave fill="var(--alba-blue)" flip className="-mt-px" />

      <div className="shell grid items-center gap-12 pb-[clamp(5rem,9vw,8rem)] pt-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-5">
          <h2 id="how-title" className="display-xl type-headline">
            {t("how.title1")}
            <br />
            {t("how.title2")}
          </h2>
          <p className="type-lede mt-6 max-w-[30ch]">{t("how.body")}</p>
          <ol className="mt-7 grid gap-3">
            {(["how.step1", "how.step2"] as const).map((k, i) => (
              <li key={k} className="flex items-baseline gap-4 text-lg">
                <span className="display-xl w-7 shrink-0 text-3xl text-alba-blue">{i + 1}</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-9">
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
          </div>
        </Reveal>

        {/* Tight interface crop: the real control, enlarged within source limits. */}
        <figure ref={zone} className="lg:col-span-6 lg:col-start-7">
          <div
            className="depth relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-36px_rgb(18_56_212/0.7)]"
            style={{ ["--dy" as string]: 24, aspectRatio: `500 / ${Math.round(899 * span)}` }}
          >
            <Picture
              id="appHome"
              alt={t("alt.appHow")}
              sizes="(min-width: 1024px) 340px, 92vw"
              className="absolute inset-x-0"
              style={{ top: `-${(WIN.top / span) * 100}%` }}
            />
            <div
              aria-hidden
              className="absolute rounded-[0.9rem] ring-[5px] ring-alba-gold"
              style={{
                left: `${BTN.x - 1.5}%`,
                width: `${BTN.w + 3}%`,
                top: `${ringTop - 2}%`,
                height: `${ringH + 4}%`,
              }}
            />
          </div>
          <figcaption className="label mt-4 text-center text-alba-blue">
            {t("how.callout")}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
