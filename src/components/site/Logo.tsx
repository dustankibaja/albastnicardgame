import { brandMark } from "@/content/brand";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Authentic Albastini mark only. The wordmark is NOT typed out: the official
 * logo file hasn't been supplied yet (see content/brand.ts). The brand name is
 * kept for screen readers via the image alt.
 */
export function Logo({ className, showTag = false }: { className?: string; showTag?: boolean }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img
        src={brandMark.src}
        alt={t("brand.name")}
        width={brandMark.width}
        height={brandMark.height}
        className="size-11 shrink-0 object-contain"
      />
      {showTag ? (
        <span className="eyebrow text-xs text-muted-foreground">{t("brand.tagline")}</span>
      ) : null}
    </span>
  );
}
