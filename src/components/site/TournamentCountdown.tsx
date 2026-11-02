import { getCountdown } from "@/lib/tournament";
import { useI18n, type TKey } from "@/lib/i18n";

const order: { key: "days" | "hours" | "minutes" | "seconds"; label: TKey }[] = [
  { key: "days", label: "tour.days" },
  { key: "hours", label: "tour.hours" },
  { key: "minutes", label: "tour.minutes" },
  { key: "seconds", label: "tour.seconds" },
];

/**
 * Pure display: the caller owns the clock (shared SSR/hydration timestamp).
 * Clamped at zero. Only rendered once a start time is verified.
 * Digits are hidden from screen readers; the date/time text carries the info.
 */
export function TournamentCountdown({ target, now }: { target: number; now: number }) {
  const { t } = useI18n();
  const parts = getCountdown(target, now);
  return (
    <div className="px-4 pt-6 sm:px-5">
      <p className="label text-alba-gold">{t("tour.startsIn")}</p>
      <div aria-hidden="true" className="mt-3 grid grid-cols-4 gap-2">
        {order.map((o) => (
          <div key={o.key} className="rounded-2xl bg-alba-blue px-1 py-4 text-center">
            <span className="display-xl block text-4xl tabular-nums sm:text-6xl">
              {String(parts[o.key]).padStart(2, "0")}
            </span>
            <span className="label mt-1 block text-sm text-alba-paper/85">{t(o.label)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
