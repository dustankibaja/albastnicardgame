import { useState } from "react";
import { Card } from "./Card";
import type { SiteImageId } from "@/content/assets";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/*
 * PRODUCT FAN — the official individual cards, live, beside the boxes.
 * Selecting a card lifts it forward. Activating a selected card turns it to
 * the approved official back (TURN, via the M1 Card primitive). Nothing turns
 * on its own; no flip happens unless the visitor asks for it.
 */
const FRONT_ALT = { red: "alt.aceRed", black: "alt.aceBlack", blue: "alt.aceBlue" } as const;

const fan: { front: SiteImageId; key: "red" | "black" | "blue" }[] = [
  { front: "aceRed", key: "red" },
  { front: "aceBlack", key: "black" },
  { front: "aceBlue", key: "blue" },
];

export function ProductFan() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);
  const [turned, setTurned] = useState<boolean[]>([false, false, false]);

  return (
    <div className="product-fan" role="group" aria-label={t("phys.fanLabel")}>
      {fan.map((c, i) => (
        <div
          key={c.key}
          className={cn(
            "product-fan-card",
            `product-fan-card--${i}`,
            selected === i && "is-selected",
          )}
          onPointerDown={() => setSelected(i)}
          onFocusCapture={() => setSelected(i)}
        >
          <Card
            front={c.front}
            back="cardBack"
            frontAlt={t(FRONT_ALT[c.key])}
            backAlt={t("alt.cardBack")}
            flipped={turned[i] ?? false}
            onFlipChange={(v) => setTurned((prev) => prev.map((x, k) => (k === i ? v : x)))}
            selected={selected === i}
          />
        </div>
      ))}
    </div>
  );
}
