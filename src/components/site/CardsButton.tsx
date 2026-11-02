import { AlbaButton, type AlbaButtonProps } from "./AlbaButton";
import { cn } from "@/lib/utils";

/**
 * PHYSICAL CARD CTA family. Always the outline style and always points to the
 * physical cards section. Wording must never imply purchase until it's real.
 */
export function CardsButton({
  className,
  onDark = false,
  variant: _v,
  asChildHref: _h,
  ...props
}: AlbaButtonProps & { onDark?: boolean }) {
  return (
    <AlbaButton
      {...props}
      asChildHref="#cards"
      variant="outline"
      className={cn(
        onDark &&
          "border-alba-paper/60 text-alba-paper hover:border-alba-paper hover:bg-alba-paper/10",
        className,
      )}
    />
  );
}
