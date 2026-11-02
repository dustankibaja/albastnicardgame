import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const options: { value: Lang; short: string; name: string }[] = [
  { value: "en", short: "EN", name: "English" },
  { value: "sw", short: "SW", name: "Kiswahili" },
];

/** EN / SW switch. `onDark` for blue/black surfaces. */
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
        "flex w-fit items-center rounded-full border-2 p-0.5",
        onDark ? "border-alba-paper/40" : "border-alba-ink/20",
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
              "h-9 min-w-11 rounded-full px-2.5 text-sm font-bold transition-colors duration-[var(--dur-fast)]",
              active
                ? onDark
                  ? "bg-alba-paper text-alba-ink"
                  : "bg-alba-ink text-alba-paper"
                : onDark
                  ? "text-alba-paper/85 hover:text-alba-paper"
                  : "text-alba-ink/75 hover:text-alba-ink",
            )}
          >
            {o.short}
          </button>
        );
      })}
    </div>
  );
}
