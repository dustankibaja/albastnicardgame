import safariBox from "@/assets/box-expansion.webp";
import { CardsButton } from "./CardsButton";
import { DownloadButton } from "./DownloadButton";
import { PhoneMockup } from "./PhoneMockup";
import { Reveal } from "./Reveal";
import { useI18n } from "@/lib/i18n";

/**
 * Two Ways to Play. Phase 1: the old standalone App section is folded in here
 * (the digital half carries the real app screenshot and the app CTA).
 * Phase 2 merges this with the hero per the CEO-approved structure.
 */
export function GameSection() {
  const { t } = useI18n();

  return (
    <section id="play" aria-labelledby="play-title" className="bg-secondary py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-muted-foreground">{t("game.eyebrow")}</p>
          <h2
            id="play-title"
            className="display-xl mt-4 text-4xl leading-[0.9] sm:text-5xl lg:text-6xl"
          >
            {t("game.title")}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* DIGITAL */}
          <Reveal>
            <article className="on-dark relative flex h-full flex-col overflow-hidden rounded-3xl bg-alba-blue p-7 text-alba-paper sm:p-10">
              <p className="eyebrow w-fit rounded-full bg-alba-paper px-3 py-1 text-xs text-alba-blue">
                {t("game.app.tag")}
              </p>
              <div className="flex justify-center py-6">
                <PhoneMockup />
              </div>
              <h3 className="display-xl mt-4 text-2xl sm:text-3xl">{t("game.app.t")}</h3>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-alba-paper/90">
                {t("game.app.b")}
              </p>
              <div className="mt-8">
                <DownloadButton className="w-full sm:w-auto">{t("cta.app")}</DownloadButton>
              </div>
            </article>
          </Reveal>

          {/* PHYSICAL */}
          <Reveal delay={100}>
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 sm:p-10">
              <p className="eyebrow w-fit rounded-full bg-alba-green px-3 py-1 text-xs text-alba-paper">
                {t("game.phys.tag")}
              </p>
              <div className="flex justify-center py-6">
                <img
                  src={safariBox}
                  alt="Albastini Safari Edition Expansion Pack box"
                  loading="lazy"
                  width={600}
                  height={489}
                  className="h-[220px] w-auto object-contain drop-shadow-2xl sm:h-[260px]"
                />
              </div>
              <h3 className="display-xl mt-4 text-2xl sm:text-3xl">{t("game.phys.t")}</h3>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
                {t("game.phys.b")}
              </p>
              <div className="mt-8">
                <CardsButton className="w-full sm:w-auto">{t("cta.cards")}</CardsButton>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
