import { Plus } from "lucide-react";
import { useRef } from "react";
import { CardNotifyForm } from "./CardNotifyForm";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { hasImage } from "@/content/assets";
import { useScrollProgress } from "@/hooks/use-depth";
import { useI18n } from "@/lib/i18n";

/*
 * TAKE THE GAME TO THE TABLE. Product first, generous white space, form last.
 *
 * Stage: the Safari Edition box (real product photo) dominates, rising out of
 * the arena above; the expansion pack supports it from behind; one ace rests
 * at the box's foot. Slots for genuine photography render only when filled:
 *  - cardsOnTable: full-bleed "the table" photo under the product stage
 *  - boxDetail:    a detail crop (needs a high-res product photo)
 * No specs, prices, stock or purchase claims.
 */
export function PhysicalCardsSection() {
  const { t } = useI18n();
  const stage = useRef<HTMLDivElement>(null);
  useScrollProgress(stage);

  return (
    <section
      id="cards"
      aria-labelledby="cards-title"
      className="relative bg-alba-paper text-alba-ink"
    >
      <div className="shell grid gap-10 pb-[clamp(5rem,10vw,9rem)] lg:grid-cols-12 lg:gap-8">
        {/* Product stage — pulled up across the arena edge. */}
        <div ref={stage} className="relative z-10 -mt-[clamp(9rem,20vw,18rem)] lg:col-span-7">
          <div className="relative mx-auto aspect-[1/1] w-full max-w-[760px]">
            <div
              className="depth absolute right-[0%] top-[24%] w-[46%]"
              style={{ ["--dy" as string]: 20 }}
            >
              <Picture
                id="boxExpansion"
                alt={t("alt.boxExpansion")}
                sizes="(min-width: 1024px) 340px, 46vw"
                className="rotate-[7deg] drop-shadow-[0_30px_40px_rgb(0_0_0/0.3)]"
              />
            </div>
            <div
              className="depth absolute left-[6%] top-0 w-[58%]"
              style={{ ["--dy" as string]: -34 }}
            >
              <Picture
                id="boxSafari"
                alt={t("alt.boxSafari")}
                sizes="(min-width: 1024px) 440px, 58vw"
                className="-rotate-[3deg] drop-shadow-[0_50px_60px_rgb(0_0_0/0.45)]"
              />
            </div>
            <div
              className="depth absolute bottom-[3%] left-[52%] w-[22%]"
              style={{ ["--dy" as string]: 56, ["--dr" as string]: 3 }}
            >
              <Picture
                id="aceBlue"
                alt={t("alt.aceBlue")}
                sizes="(min-width: 1024px) 170px, 22vw"
                className="rotate-[16deg] overflow-hidden rounded-[8%] shadow-[0_22px_34px_-14px_rgb(0_0_0/0.5)]"
              />
            </div>
          </div>
        </div>

        <Reveal className="self-end lg:col-span-5 lg:pb-6">
          <h2 id="cards-title" className="display-xl type-headline">
            {t("phys.title1")}
            <br />
            {t("phys.title2")}
          </h2>
          <p className="type-lede mt-6 max-w-[28ch]">{t("phys.body")}</p>
          <p className="label mt-6 inline-block rounded-full bg-alba-gold px-4 py-2">
            {t("phys.status")}
          </p>

          {/* Form second: folded away, honest about being closed. */}
          <details className="group mt-10 max-w-md border-y-2 border-alba-ink">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-xl font-extrabold uppercase [font-stretch:78%] [&::-webkit-details-marker]:hidden">
              {t("form.toggle")}
              <Plus
                aria-hidden
                className="size-6 transition-transform duration-[var(--dur-std)] group-open:rotate-45"
              />
            </summary>
            <div className="pb-6">
              <CardNotifyForm />
            </div>
          </details>
        </Reveal>
      </div>

      {hasImage("cardsOnTable") || hasImage("boxDetail") ? (
        <div className="shell grid gap-6 pb-[clamp(5rem,10vw,9rem)] md:grid-cols-12">
          <Picture
            id="cardsOnTable"
            alt=""
            sizes="(min-width: 768px) 66vw, 100vw"
            className="overflow-hidden rounded-[1.5rem] md:col-span-8"
          />
          <Picture
            id="boxDetail"
            alt=""
            sizes="(min-width: 768px) 30vw, 100vw"
            className="overflow-hidden rounded-[1.5rem] md:col-span-4"
          />
        </div>
      ) : null}
    </section>
  );
}
