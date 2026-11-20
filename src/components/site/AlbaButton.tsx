import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * CARD-EDGE BUTTON — the approved Albastini action.
 *  - 12px card-edge radius (not a pill)
 *  - printed keyline (1.5px inset, like the border of a card)
 *  - one card-derived corner cut at the top-right (the card's index corner)
 *  - the 11-point disc carries the arrow (the chip), but the button still reads
 *    as Albastini with the chip covered: the edge, keyline and cut do the work
 *  - hover: internal fill deal (scaleX), label +3px, chip +4px with a 12° tilt
 *  - press: 1px compression + inner shadow (no scale, no glow)
 *  - focus: scene-aware ring (--focus), 3px, offset 3px (no glow)
 * All motion is transform/opacity and uses the M1 motion tokens.
 */
export const albaButton = cva(
  [
    "btn-edge group relative isolate inline-flex items-center justify-center gap-3 whitespace-nowrap",
    "font-display font-extrabold uppercase [font-stretch:78%] tracking-[0.02em] leading-none",
    "transition-transform duration-[var(--dur-fast)] ease-[var(--ease-std)]",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--focus,var(--alba-blue))]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-alba-gold text-alba-ink shadow-[inset_0_0_0_1.5px_var(--alba-ink)] [--focus:var(--alba-blue)]",
        outline:
          "bg-transparent text-current shadow-[inset_0_0_0_1.5px_currentColor] [--focus:currentColor]",
      },
      size: {
        sm: "h-11 pl-4 pr-1.5 text-[0.95rem] [--chip:2rem]",
        md: "h-12 pl-6 pr-1.5 text-[1.05rem] [--chip:2.4rem]",
        lg: "h-14 pl-8 pr-2 text-[1.15rem] [--chip:2.6rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type AlbaButtonProps = ComponentProps<"button"> &
  VariantProps<typeof albaButton> & { asChildHref?: string; children?: ReactNode };

/** The 11-point disc with a directional arrow. Decorative; the label is the name. */
function Chip({ variant }: { variant: "primary" | "outline" | null | undefined }) {
  const onPrimary = variant !== "outline";
  return (
    <span className="btn-chip" aria-hidden="true">
      <svg
        viewBox="0 0 40 40"
        className="btn-chip-disc"
        data-on={onPrimary ? "primary" : "outline"}
      >
        <circle cx="20" cy="20" r="18.6" />
        <circle cx="20" cy="20" r="12.6" className="btn-chip-ring" />
      </svg>
      <svg viewBox="0 0 24 24" className="btn-chip-arrow">
        <path d="M5 12h13M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

export function AlbaButton({
  className,
  variant,
  size,
  asChildHref,
  children,
  ...props
}: AlbaButtonProps) {
  const inner = (
    <>
      {/* body fill: deals across on hover */}
      <span className="btn-fill" aria-hidden="true" />
      <span className="btn-label">{children}</span>
      <Chip variant={variant} />
    </>
  );
  const cls = cn(albaButton({ variant, size }), `btn-${variant ?? "primary"}`, className);
  if (asChildHref) {
    return (
      <a href={asChildHref} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} {...props}>
      {inner}
    </button>
  );
}
