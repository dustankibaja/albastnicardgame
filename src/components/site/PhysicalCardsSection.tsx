import cardBlack from "@/assets/card-black-official.webp";
import cardBlue from "@/assets/card-blue-official.webp";
import cardRed from "@/assets/card-red-official.webp";
import safariBox from "@/assets/box-safari-retail.webp";
import { CardNotifyForm } from "./CardNotifyForm";
import { Reveal } from "./Reveal";
import { useI18n } from "@/lib/i18n";

const cards = [
  { src: cardRed, alt: "Albastini red ace card", rotate: "-rotate-6" },
  { src: cardBlack, alt: "Albastini black ace card", rotate: "rotate-2" },
  { src: cardBlue, alt: "Albastini blue ace card", rotate: "rotate-6" },
];

/**
 * Physical cards. No purchase, price, stock or product-spec claims: none are
 * verified. Copy is limited to what the supplied product imagery shows.
 */
export function PhysicalCardsSection() {
  const { t } = useI18n();

  return (
    <section id="cards" aria-labelledby="cards-title" className="bg-secondary py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <Reveal>
          <div className="flex flex-col items-center gap-8">
            <img
              src={safariBox}
              alt="Albastini Safari Edition box"
              loading="lazy"
              width={600}
              height={1088}
              className="w-full max-w-[300px] object-contain drop-shadow-2xl sm:max-w-[360px]"
            />
            <div className="flex justify-center gap-3">
              {cards.map((c) => (
                <img
                  key={c.alt}
                  src={c.src}
                  alt={c.alt}
                  loading="lazy"
                  className={`w-20 rounded-xl bg-alba-paper shadow-card sm:w-28 ${c.rotate}`}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className="eyebrow text-muted-foreground">{t("phys.eyebrow")}</p>
          <h2
            id="cards-title"
            className="display-xl mt-4 text-4xl leading-[0.9] sm:text-5xl lg:text-6xl"
          >
            {t("phys.title")}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            {t("phys.body")}
          </p>
          <p className="mt-6 w-fit rounded-full bg-alba-gold px-4 py-2 text-sm font-bold text-alba-ink">
            {t("phys.status")}
          </p>

          <div className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
            {/* Closed until a real backend, consent wording and notification channel exist. */}
            <CardNotifyForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
