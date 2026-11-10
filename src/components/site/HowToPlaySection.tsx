import { DownloadButton } from "./DownloadButton";
import { Reveal } from "./Reveal";
import { Wave } from "./Wave";
import { useI18n } from "@/lib/i18n";

/*
 * HOW TO PLAY — the official English tutorial, embedded.
 * Not autoplayed. Normal YouTube controls remain. The video is the only
 * instruction on the page: visitors are not sent into the app to learn the game.
 * There is no language switch: only the real English tutorial exists today.
 */
const TUTORIAL_ID = "wGd1QJHSU0E";

export function HowToPlaySection() {
  const { t } = useI18n();

  return (
    <section
      id="how-to-play"
      aria-labelledby="how-title"
      className="relative overflow-x-clip bg-alba-paper text-alba-ink"
    >
      <Wave fill="var(--alba-blue)" flip className="-mt-px" />
      <div className="shell grid items-center gap-12 pb-[clamp(5rem,9vw,8rem)] pt-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-5">
          <h2 id="how-title" className="display-xl type-headline">
            <span className="keep block">{t("how.title1")}</span>
            <span className="keep block">{t("how.title2")}</span>
          </h2>
          <div className="mt-9">
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-7">
          <figure>
            <div className="how-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${TUTORIAL_ID}`}
                title={t("how.videoTitle")}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <figcaption className="label mt-4 text-alba-blue">{t("how.videoCaption")}</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
