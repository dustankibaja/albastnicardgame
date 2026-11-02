import cardBlack from "@/assets/card-black-official-v2.webp";
import cardBlue from "@/assets/card-blue-official.webp";
import cardFan from "@/assets/card-fan.webp";
import cardRed from "@/assets/card-red-official.webp";
import { CardsButton } from "./CardsButton";
import { DownloadButton } from "./DownloadButton";
import { useI18n } from "@/lib/i18n";

const heroCards = [
  {
    src: cardRed,
    alt: "Albastini red ace playing card",
    className: "-rotate-12 -mr-10 z-10 translate-y-6",
  },
  {
    src: cardBlack,
    alt: "Albastini black ace playing card",
    className: "-rotate-2 z-20",
  },
  {
    src: cardBlue,
    alt: "Albastini blue ace playing card",
    className: "rotate-10 -ml-10 z-10 translate-y-6",
  },
];

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      {/* geometric brand details */}
      <div
        aria-hidden
        className="triangle-band pointer-events-none absolute -right-10 top-24 hidden h-56 w-56 sm:block text-alba-blue lg:h-80 lg:w-80"
      />
      <div aria-hidden className="alba-dots pointer-events-none absolute inset-0 opacity-[0.35]" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[0.95fr_1fr] lg:gap-10 lg:pb-28">
        <div className="max-w-xl lg:max-w-2xl">
          <span className="eyebrow inline-flex items-center gap-2 text-muted-foreground">
            <span className="kanga-rule inline-block h-1 w-8 rounded-full" />
            {t("hero.eyebrow")}
          </span>

          <h1 className="display-xl mt-6 text-[3.25rem] leading-[0.86] tracking-[-0.01em] sm:text-7xl lg:text-[6.4rem]">
            {t("hero.title")}
          </h1>

          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.sub")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <DownloadButton size="lg" className="w-full sm:w-auto">
              {t("cta.app")}
            </DownloadButton>
            <CardsButton size="lg" className="w-full sm:w-auto">
              {t("cta.cards")}
            </CardsButton>
          </div>
        </div>

        <div className="relative">
          {/* Deliberate overlapping card composition — the real Albastini artwork. */}
          <div className="relative mx-auto hidden max-w-[720px] items-end justify-center sm:flex">
            {heroCards.map((c) => (
              <img
                key={c.alt}
                src={c.src}
                alt={c.alt}
                width={500}
                height={710}
                className={`w-[34%] rounded-xl bg-white shadow-[0_28px_50px_rgba(0,0,0,0.45)] ${c.className}`}
              />
            ))}
          </div>

          {/* Mobile: the fan artwork reads better at small widths. */}
          <div className="relative mx-auto max-w-[440px] sm:hidden">
            <img
              src={cardFan}
              alt="A fan of Albastini playing cards in green, red, black and blue with the yellow points chip"
              width={600}
              height={600}
              className="w-full drop-shadow-[0_36px_60px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
      </div>

      <div aria-hidden className="kanga-rule h-1.5 w-full" />
    </section>
  );
}
