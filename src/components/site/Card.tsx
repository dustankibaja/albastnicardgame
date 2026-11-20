import { useState, type KeyboardEvent } from "react";
import { Picture } from "./Picture";
import type { SiteImageId } from "@/content/assets";
import { cn } from "@/lib/utils";

/*
 * CARD — the official Albastini card primitive.
 *
 * Front and back share ONE box (the same 512x768 canvas, aspect 2:3), so the
 * card never changes its apparent size while it turns. The flip is rotateY on a
 * preserve-3d container; each face is backface-hidden. Nothing inside the box
 * changes dimension, so layout never shifts.
 *
 * Interaction:
 *  - flip: click / tap, or Enter / Space when focused (a real <button>)
 *  - selected: a lift (translateY) and a keyline, independent of flipping
 *  - reduced motion: the flip becomes an instant face change; state is still shown
 *
 * No auto-flip. No continuous motion. No glow.
 */
export function Card({
  front,
  back,
  frontAlt,
  backAlt,
  flipped: controlled,
  onFlipChange,
  selected = false,
  size = "md",
  className,
}: {
  front: SiteImageId;
  back: SiteImageId;
  frontAlt: string;
  backAlt: string;
  /** Controlled flipped state. Omit to let the card manage its own. */
  flipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [internal, setInternal] = useState(false);
  const isFlipped = controlled ?? internal;

  const toggle = () => {
    const next = !isFlipped;
    if (controlled === undefined) setInternal(next);
    onFlipChange?.(next);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  const width = { sm: "7.5rem", md: "10.5rem", lg: "14rem" }[size];

  return (
    <button
      type="button"
      className={cn("card-button", selected && "card-selected", className)}
      style={{ width }}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? backAlt : frontAlt}
      onClick={toggle}
      onKeyDown={onKey}
    >
      <span className={cn("card-turn", isFlipped && "card-turn--flipped")}>
        <span className="card-face card-face--front">
          <Picture
            id={front}
            alt=""
            sizes={width}
            className="card-img"
            imgClassName="block h-auto w-full"
          />
        </span>
        <span className="card-face card-face--back">
          <Picture
            id={back}
            alt=""
            sizes={width}
            className="card-img"
            imgClassName="block h-auto w-full"
          />
        </span>
      </span>
    </button>
  );
}
