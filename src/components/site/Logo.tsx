import { Picture } from "./Picture";
import { brandMark } from "@/content/brand";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Official Albastini mark (asset registry → responsive AVIF/WebP). */
export function Logo({ className, size = 44 }: { className?: string; size?: number }) {
  const { t } = useI18n();
  return (
    <Picture
      id={brandMark.id}
      alt={t("brand.name")}
      sizes={`${size}px`}
      priority
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      imgClassName="h-full w-full object-contain"
    />
  );
}
