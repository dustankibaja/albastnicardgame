import { getCountdown } from "@/lib/tournament";
import { useI18n, type TKey } from "@/lib/i18n";

const order: { key: "days" | "hours" | "minutes" | "seconds"; label: TKey }[] = [
  { key: "days", label: "tour.days" },
  { key: "hours", label: "tour.hours" },
  { key: "minutes", label: "tour.minutes" },
  { key: "seconds", label: "tour.seconds" },
];

/**
 * Pure display: the caller owns the clock, so server and client render the
 * same numbers from the same `now` during hydration. Values are clamped at 0.
 * The ticking digits are hidden from screen readers (the date/time text next
 * to it carries the information) to avoid noisy announcements.
 */
export function TournamentCountdown({ target, now }: { target: number; now: number }) {
  const { t } = useI18n();
  const parts = getCountdown(target, now);

  return (
    <div className="rounded-3xl bg-alba-ink p-5 sm:p-7">
      <p className="eyebrow text-alba-gold">{t("tour.startsIn")}</p>
      <div aria-hidden="true" className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
        {order.map((o) => (
          <div
            key={o.key}
            className="rounded-2xl border border-alba-paper/20 px-1 py-4 text-center"
          >
            <span className="display-xl block text-3xl tabular-nums text-alba-paper sm:text-5xl">
              {String(parts[o.key]).padStart(2, "0")}
            </span>
            <span className="eyebrow mt-2 block text-xs text-alba-paper/80">{t(o.label)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
