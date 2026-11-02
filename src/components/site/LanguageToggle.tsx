import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const options: { value: Lang; short: string; name: string }[] = [
  { value: "en", short: "EN", name: "English" },
  { value: "sw", short: "SW", name: "Kiswahili" },
];

/** EN / SW switch. Each option names its language in that language. */
export function LanguageToggle({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const { t, lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={cn(
        "flex items-center rounded-full border p-0.5",
        onDark ? "border-alba-paper/30" : "border-border",
        className,
      )}
    >
      {options.map((o) => {
        const active = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            lang={o.value}
            aria-pressed={active}
            aria-label={o.name}
            onClick={() => setLang(o.value)}
            className={cn(
              "eyebrow min-h-9 min-w-10 rounded-full px-2.5 text-xs transition-colors",
              active
                ? "bg-alba-ink text-alba-paper"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.short}
          </button>
        );
      })}
    </div>
  );
}
