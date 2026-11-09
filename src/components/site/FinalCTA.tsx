import { CardsButton } from "./CardsButton";
import { Wave } from "./Wave";
import { DownloadButton } from "./DownloadButton";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { useI18n } from "@/lib/i18n";

/*
 * THE FINALE. A poster, not a footer-adjacent CTA block.
 *  - READY TO PLAY? dominates; the phrase and the two actions follow.
 *  - The three official aces are the authority: a fan, the blue ace in front.
 *    The blue ace is the same artwork that leaves the Physical Cards fan
 *    (match-cut continuity), so the ending reads as the same product.
 *  - No crown: the crown only appears in the brand mark. Nothing here competes
 *    with the message.
 * Desktop: copy left, fan right. Mobile: copy first, fan below the actions.
 */
export function FinalCTA() {
  const { t } = useI18n();

  return (
    <section
      id="finale"
      aria-labelledby="final-title"
      className="finale on-dark relative z-10 overflow-x-clip bg-alba-ink text-alba-paper"
    >
      {/* the white table gives way to the finale along the card-wave, as at every join */}
      <Wave fill="var(--alba-paper)" flip className="absolute inset-x-0 top-0 -mt-px z-0" />
      <div className="shell finale-grid relative z-[1]">
        <Reveal className="finale-copy">
          <h2 id="final-title" className="display-xl type-poster">
            <span className="keep block">{t("final.title1")}</span>
            <span className="keep block">{t("final.title2")}</span>
          </h2>
          <p className="finale-phrase display-xl text-alba-gold">{t("brand.tagline")}</p>
          <div className="finale-actions">
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
            <CardsButton size="lg" className="w-full sm:w-auto">
              {t("cta.cards")}
            </CardsButton>
          </div>
        </Reveal>

        <Reveal className="finale-fan" delay={120}>
          <div aria-hidden="true" className="finale-fan-inner">
            <Picture
              id="aceRed"
              alt=""
              sizes="(min-width: 1024px) 26vw, 38vw"
              className="finale-card finale-card--red"
              imgClassName="block h-auto w-full"
            />
            <Picture
              id="aceBlack"
              alt=""
              sizes="(min-width: 1024px) 26vw, 38vw"
              className="finale-card finale-card--black"
              imgClassName="block h-auto w-full"
            />
            <Picture
              id="aceBlue"
              alt=""
              sizes="(min-width: 1024px) 26vw, 38vw"
              className="finale-card finale-card--blue"
              imgClassName="block h-auto w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
