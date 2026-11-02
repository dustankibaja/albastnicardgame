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
 * the arena above; the expansion pack supports it; the genuine photo of nine
 * card fronts lies beneath them. The table photo is used once only (Two Ways).
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
      // The product is pulled up into the arena by the stage offset, so the
      // anchor clears the navbar, that offset, and the box's rotation/parallax
      // overhang (+3.5rem): visitors land with the whole product in view.
      style={{ scrollMarginTop: "calc(8.5rem + clamp(9rem, 20vw, 18rem))" }}
    >
      <div className="shell grid gap-10 pb-[clamp(5rem,10vw,9rem)] lg:grid-cols-12 lg:gap-8">
        {/* Product stage — pulled up across the arena edge. */}
        <div ref={stage} className="relative z-10 -mt-[clamp(9rem,20vw,18rem)] lg:col-span-7">
          <div className="relative mx-auto aspect-[1/1] w-full max-w-[760px]">
            {/* Genuine photo of nine card fronts on pure white (real_source_photo,
                not official scans): it merges into the page, so the real cards
                lie on the table beneath the boxes. Lowest layer. */}
            <div
              className="depth absolute left-[22%] w-[78%]"
              style={{
                // Drift capped below the 12px clearance (0.75rem) so parallax can
                // never lift the photo over the arena edge.
                ["--dy" as string]: 10,
                // Anchored just below the arena edge (= this stage's pull-up),
                // so the photo's white ground never shows over the night blue.
                top: "calc(clamp(9rem, 20vw, 18rem) + 0.75rem)",
              }}
            >
              <Picture
                id="cardFrontsOnWhite"
                alt={t("alt.fronts")}
                sizes="(min-width: 1024px) 590px, 78vw"
              />
            </div>
            <div
              className="depth absolute right-[0%] top-[14%] z-10 w-[44%]"
              style={{ ["--dy" as string]: 20 }}
            >
              <Picture
                id="boxExpansion"
                alt={t("alt.boxExpansion")}
                sizes="(min-width: 1024px) 340px, 44vw"
                className="rotate-[7deg] drop-shadow-[0_30px_40px_rgb(0_0_0/0.3)]"
              />
            </div>
            <div
              className="depth absolute -top-[4%] left-[4%] z-20 w-[54%]"
              style={{ ["--dy" as string]: -34 }}
            >
              <Picture
                id="boxSafari"
                alt={t("alt.boxSafari")}
                sizes="(min-width: 1024px) 420px, 54vw"
                className="-rotate-[3deg] drop-shadow-[0_50px_60px_rgb(0_0_0/0.45)]"
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

      {/* Detail crop slot: renders only once a high-res product photo exists. */}
      {hasImage("boxDetail") ? (
        <div className="shell pb-[clamp(5rem,10vw,9rem)]">
          <Picture
            id="boxDetail"
            alt=""
            sizes="(min-width: 768px) 40vw, 100vw"
            className="max-w-xl overflow-hidden rounded-[1.5rem]"
          />
        </div>
      ) : null}
    </section>
  );
}
