import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Two CTA families only (see DownloadButton / CardsButton):
 *   primary  = APP actions (yellow)
 *   outline  = PHYSICAL CARD actions (outline in the current text colour)
 * Interaction motion uses the FAST/STANDARD tokens; transform/colour only.
 */
export const albaButton = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-display font-extrabold uppercase [font-stretch:78%] tracking-[0.02em]",
    "transition-[transform,background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-std)]",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-alba-gold text-alba-ink hover:-translate-y-0.5",
        outline:
          "border-2 border-current bg-transparent text-current hover:-translate-y-0.5 hover:bg-current/10",
      },
      size: {
        sm: "h-10 px-4 text-[0.95rem]",
        md: "h-12 px-6 text-[1.05rem]",
        lg: "h-14 px-8 text-[1.15rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type AlbaButtonProps = ComponentProps<"button"> &
  VariantProps<typeof albaButton> & { asChildHref?: string };

export function AlbaButton({ className, variant, size, asChildHref, ...props }: AlbaButtonProps) {
  if (asChildHref) {
    return (
      <a href={asChildHref} className={cn(albaButton({ variant, size }), className)}>
        {props.children}
      </a>
    );
  }
  return <button className={cn(albaButton({ variant, size }), className)} {...props} />;
}
