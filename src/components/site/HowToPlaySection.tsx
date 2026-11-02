import { DownloadButton } from "./DownloadButton";
import { Reveal } from "./Reveal";
import { useI18n } from "@/lib/i18n";

/**
 * How to Play. No rules, tutorial or video are shown on the site until the team
 * supplies approved material. This points to the real How to Play entry that
 * exists on the app's home screen.
 */
export function HowToPlaySection() {
  const { t } = useI18n();
  return (
    <section id="how-to-play" aria-labelledby="how-title" className="py-20 lg:py-28">
      <Reveal className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-muted-foreground">{t("how.eyebrow")}</p>
          <h2 id="how-title" className="display-xl mt-4 text-4xl sm:text-5xl lg:text-6xl">
            {t("how.title")}
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            {t("how.body")}
          </p>
          <div className="mt-8">
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
