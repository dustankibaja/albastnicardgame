import { useRef } from "react";
import { DownloadButton } from "./DownloadButton";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { useScrollProgress } from "@/hooks/use-depth";
import { useI18n } from "@/lib/i18n";

/*
 * How to Play. No rules, video or tutorial steps are invented: the two steps
 * are navigation facts (get the app, open the How to Play entry that exists
 * on the app's home screen). The visual zooms into the real screenshot and
 * marks that entry.
 *
 * Highlight geometry: the How to Play button spans x 6–93% and y 65.2–73.6%
 * of app-home-public.webp (500×899). The window below shows y 40–100%.
 */
const WINDOW_TOP = 0.4; // fraction of the screenshot hidden above the window
const BTN = { x: 6, w: 87.2, top: 0.652, bottom: 0.736 };

export function HowToPlaySection() {
  const { t } = useI18n();
  const zone = useRef<HTMLDivElement>(null);
  useScrollProgress(zone);

  const visible = 1 - WINDOW_TOP;
  const ringTop = ((BTN.top - WINDOW_TOP) / visible) * 100;
  const ringH = ((BTN.bottom - BTN.top) / visible) * 100;

  return (
    <section
      id="how-to-play"
      aria-labelledby="how-title"
      className="relative overflow-x-clip bg-alba-paper pb-[var(--section-y)] text-alba-ink"
    >
      <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-6">
          <h2 id="how-title" className="display-xl text-[clamp(3.25rem,8.5vw,7.5rem)]">
            {t("how.title1")}
            <br />
            {t("how.title2")}
          </h2>
          <p className="mt-6 max-w-[34ch] text-xl leading-snug">{t("how.body")}</p>
          <ol className="mt-8 grid gap-4">
            {(["how.step1", "how.step2"] as const).map((k, i) => (
              <li key={k} className="flex items-baseline gap-4 text-lg">
                <span className="display-xl w-8 shrink-0 text-4xl text-alba-blue">{i + 1}</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
          </div>
        </Reveal>

        {/* Zoom into the real app screen. */}
        <div ref={zone} className="relative lg:col-span-6">
          <div
            className="depth relative mx-auto w-[86%] max-w-[380px] rounded-t-[2.6rem] bg-alba-ink px-[4.5%] pt-[4.5%] shadow-[0_50px_90px_-40px_rgb(18_56_212/0.6)]"
            style={{ ["--dy" as string]: 30 }}
          >
            <div
              className="relative overflow-hidden rounded-t-[2rem]"
              style={{ aspectRatio: `500 / ${Math.round(899 * visible)}` }}
            >
              <Picture
                id="appHome"
                alt={t("alt.appHow")}
                sizes="(min-width: 1024px) 380px, 86vw"
                className="absolute inset-x-0"
                style={{ top: `-${(WINDOW_TOP / visible) * 100}%` }}
              />
              <div
                aria-hidden
                className="absolute rounded-[0.9rem] ring-[5px] ring-alba-gold ring-offset-[3px] ring-offset-transparent"
                style={{
                  left: `${BTN.x - 1.5}%`,
                  width: `${BTN.w + 3}%`,
                  top: `${ringTop - 1.5}%`,
                  height: `${ringH + 3}%`,
                }}
              />
            </div>
          </div>
          <p className="label mt-5 text-center text-alba-blue">{t("how.callout")}</p>
        </div>
      </div>
    </section>
  );
}
