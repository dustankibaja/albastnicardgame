import { Plus } from "lucide-react";
import { useRef } from "react";
import { CardNotifyForm } from "./CardNotifyForm";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { useScrollProgress } from "@/hooks/use-depth";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * TAKE THE GAME TO THE TABLE. Product first, form second.
 * The Safari Edition box rises out of the arena above (overlapping the
 * section edge) and lands on the white "table". Copy is limited to what the
 * product imagery shows: no specs, prices, stock or purchase claims.
 */
const scattered = [
  {
    id: "aceRed" as const,
    alt: "alt.aceRed" as const,
    cls: "left-[0%] bottom-[0%] -rotate-[18deg]",
    dy: 50,
  },
  {
    id: "aceBlue" as const,
    alt: "alt.aceBlue" as const,
    cls: "right-[0%] bottom-[8%] rotate-[14deg]",
    dy: 70,
  },
];

export function PhysicalCardsSection() {
  const { t } = useI18n();
  const stage = useRef<HTMLDivElement>(null);
  useScrollProgress(stage);

  return (
    <section
      id="cards"
      aria-labelledby="cards-title"
      className="relative bg-alba-paper pb-[var(--section-y)] text-alba-ink"
    >
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Product stage — pulled up across the section edge. */}
        <div ref={stage} className="relative z-10 -mt-[clamp(8rem,18vw,16rem)] lg:col-span-7">
          <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[720px]">
            <div
              className="depth absolute right-[2%] top-[20%] w-[50%]"
              style={{ ["--dy" as string]: 24 }}
            >
              <Picture
                id="boxExpansion"
                alt={t("alt.boxExpansion")}
                sizes="(min-width: 1024px) 360px, 50vw"
                className="rotate-[6deg] drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)]"
              />
            </div>
            <div
              className="depth absolute left-[8%] top-0 w-[56%]"
              style={{ ["--dy" as string]: -30 }}
            >
              <Picture
                id="boxSafari"
                alt={t("alt.boxSafari")}
                sizes="(min-width: 1024px) 400px, 56vw"
                className="-rotate-[3deg] drop-shadow-[0_40px_50px_rgb(0_0_0/0.45)]"
              />
            </div>
            {scattered.map((c) => (
              <div
                key={c.id}
                className={cn("depth absolute w-[26%]", c.cls)}
                style={{ ["--dy" as string]: c.dy }}
              >
                <Picture
                  id={c.id}
                  alt={t(c.alt)}
                  sizes="(min-width: 1024px) 150px, 26vw"
                  className="overflow-hidden rounded-[8%] shadow-[0_20px_30px_-14px_rgb(0_0_0/0.5)]"
                />
              </div>
            ))}
          </div>
        </div>

        <Reveal className="lg:col-span-5 lg:pt-28">
          <h2 id="cards-title" className="display-xl text-[clamp(3.5rem,7.5vw,7rem)]">
            {t("phys.title1")}
            <br />
            {t("phys.title2")}
          </h2>
          <p className="mt-6 max-w-[34ch] text-xl leading-snug">{t("phys.body")}</p>
          <p className="label mt-6 inline-block rounded-full bg-alba-gold px-4 py-2">
            {t("phys.status")}
          </p>

          {/* Form second: folded away, honest about being closed. */}
          <details className="group mt-10 max-w-lg border-y-2 border-alba-ink">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-2xl font-extrabold uppercase [font-stretch:78%] [&::-webkit-details-marker]:hidden">
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
    </section>
  );
}
