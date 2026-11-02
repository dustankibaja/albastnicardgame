import { AlbaButton, type AlbaButtonProps } from "./AlbaButton";

/**
 * PHYSICAL CARD CTA family. Always the outline style (inherits the text colour
 * of its surroundings, so it works on blue, black and white) and always points
 * to the physical cards section. Never implies purchase.
 */
export function CardsButton({
  variant: _v,
  asChildHref: _h,
  onDark: _d,
  ...props
}: AlbaButtonProps & { onDark?: boolean }) {
  return <AlbaButton {...props} asChildHref="#cards" variant="outline" />;
}
