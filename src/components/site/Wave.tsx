import { cn } from "@/lib/utils";

/**
 * Section edge drawn from the wave band printed across every Albastini card
 * face. Used sparingly to join chapters; it is the only decorative shape.
 */
export function Wave({
  className,
  flip = false,
  fill = "currentColor",
}: {
  className?: string;
  flip?: boolean;
  fill?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none block h-[clamp(44px,7vw,120px)] w-full",
        flip && "rotate-180",
        className,
      )}
    >
      <path
        d="M0 72 C 220 12, 470 0, 720 46 S 1180 112, 1440 38 L 1440 120 L 0 120 Z"
        fill={fill}
      />
    </svg>
  );
}
