import { brandMark } from "@/content/brand";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Authentic Albastini mark (card fan + crown). The official wordmark file has
 * not been supplied, so no wordmark is typed out (see content/brand.ts).
 */
export function Logo({ className, size = 44 }: { className?: string; size?: number }) {
  const { t } = useI18n();
  return (
    <img
      src={brandMark.src}
      alt={t("brand.name")}
      width={brandMark.width}
      height={brandMark.height}
      style={{ width: size, height: size }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
