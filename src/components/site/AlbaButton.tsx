import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const albaButton = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-extrabold uppercase tracking-[0.12em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-chip hover:-translate-y-0.5 hover:brightness-105",
        ink: "bg-foreground text-background hover:-translate-y-0.5",
        outline:
          "border-2 border-foreground/25 text-foreground hover:-translate-y-0.5 hover:border-foreground/60 hover:bg-foreground/5",
        blue: "bg-alba-blue text-white shadow-card hover:-translate-y-0.5 hover:brightness-110",
        quiet: "text-foreground/70 hover:text-foreground",
      },
      size: {
        sm: "h-10 px-4 text-xs",
        md: "h-11 px-6 text-xs sm:text-sm",
        lg: "h-13 px-8 text-sm sm:text-base",
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
