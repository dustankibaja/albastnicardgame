import { useEffect, useRef, useState } from "react";
import { Picture } from "./Picture";
import { Wave } from "./Wave";
import { PhoneMockup } from "./PhoneMockup";
import { useI18n } from "@/lib/i18n";

/*
 * TABLE → SCREEN — the signature chapter.
 *
 * A short sticky stage. Scroll position is the ONLY input: progress p ∈ [0,1]
 * is computed from where the chapter sits in the viewport and written to one
 * CSS variable (--p). CSS maps p onto the five phases; nothing is scripted per
 * frame and fast or reverse scrolling always lands on the state for that p.
 *
 *   TABLE   (p 0.00–0.20)  fan of physical cards on the real table
 *   ALIGN   (p 0.20–0.45)  rotations close, the fan squares into one deck
 *   REVEAL  (p 0.45–0.60)  the phone is visible behind the deck
 *   HAND-OFF(p 0.60–0.80)  phone slides forward; deck settles back/down
 *   SCREEN  (p 0.80–1.00)  the phone dominates; the deck stays as the foundation
 *
 * Reduced motion: no scroll mapping; the end state is shown statically.
 */
export function TableToScreen() {
  const { t } = useI18n();
  const chapter = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const el = chapter.current;
    if (!el) return;
    let pending = 0;
    const update = () => {
      pending = 0;
      // Progress is linear in scroll: 0 when the chapter's top reaches the viewport top,
      // 1 when its bottom reaches the viewport bottom. Measured from the chapter box.
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / travel));
      el.style.setProperty("--p", p.toFixed(4));
      // Stacking changes ONCE, at the hand-off (p ≥ 0.6), not before the phone has risen.
      el.dataset["layer"] = p >= 0.6 ? "front" : "behind";
    };
    const onScroll = () => {
      if (!pending) pending = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (pending) cancelAnimationFrame(pending);
    };
  }, []);

  return (
    <section
      ref={chapter}
      id="table-to-screen"
      aria-label={t("two.title1") + " " + t("two.title2")}
      className={"tts relative bg-alba-paper text-alba-ink" + (reduced ? " tts--static" : "")}
    >
      <div className="tts-stage sticky top-0 h-[100svh] overflow-hidden">
        <Picture
          id="cardsOnTable"
          alt={t("alt.table")}
          sizes="100vw"
          className="tts-table absolute inset-0"
          imgClassName="h-full w-full object-cover object-[46%_58%]"
        />
        <div aria-hidden className="tts-shade absolute inset-0" />
        {/* the chapter joins the paper section along the card-wave, as everywhere else */}
        <Wave fill="var(--alba-paper)" className="absolute inset-x-0 bottom-0 z-[4] -mb-px" />

        <h2 className="tts-title absolute left-0 right-0 top-[9vh] shell display-xl type-headline text-alba-paper">
          <span className="tts-line tts-line--table keep block">{t("two.title1")}</span>
          <span className="tts-line tts-line--screen keep block text-alba-gold">
            {t("two.title2")}
          </span>
        </h2>

        <div className="tts-deck absolute" aria-hidden="true">
          <DeckCard id="aceRed" k={0} />
          <DeckCard id="aceBlack" k={1} />
          <DeckCard id="aceBlue" k={2} />
        </div>

        <div className="tts-phone absolute" aria-hidden="true">
          <PhoneMockup alt="" sizes="(min-width: 1024px) 26vw, 62vw" className="-rotate-2" />
        </div>
      </div>
    </section>
  );
}

/** One physical card. Its position is set entirely by CSS from --p and --k. */
function DeckCard({ id, k }: { id: "aceRed" | "aceBlack" | "aceBlue"; k: number }) {
  return (
    <div className="tts-card" style={{ ["--k" as string]: k }}>
      <Picture
        id={id}
        alt=""
        sizes="(min-width: 1024px) 16vw, 36vw"
        className="tts-card-face"
        imgClassName="block h-auto w-full"
      />
    </div>
  );
}
