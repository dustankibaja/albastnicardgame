import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * NUMERAL — the Albastini number grammar as one component.
 * Every figure on the site goes through a role, never a raw size:
 *   points   11        the token's number
 *   event    27        tournament number (outline: architecture, decorative)
 *   rank     01        placement / collector index (outline)
 *   prize    130,000   tabular figures, TSH secondary
 *   date     12 DEC 2026, separators are the 11-point chip
 * Outline roles are decorative and must be hidden from assistive technology
 * by the caller (aria-hidden); the filled prize/date carry the meaning.
 */
export type NumeralRole = "points" | "event" | "rank" | "prize" | "date";

export function Numeral({
  role,
  outline = false,
  children,
  className,
  unit,
  ...rest
}: {
  role: NumeralRole;
  outline?: boolean;
  children: ReactNode;
  className?: string;
  /** Secondary unit, e.g. "TSH". */
  unit?: string;
  "aria-hidden"?: boolean;
}) {
  const roleClass = {
    points: "num-points",
    event: "num-event",
    rank: "num-rank",
    prize: "num-prize",
    date: "num-date",
  }[role];
  return (
    <span className={cn("num-base", roleClass, outline && "num-outline", className)} {...rest}>
      {children}
      {unit ? <span className="num-prize-unit">{unit}</span> : null}
    </span>
  );
}

/** Date with the 11-point chip as its separator: 12 · DEC · 2026. */
export function DateNumeral({
  day,
  month,
  year,
  className,
}: {
  day: string;
  month: string;
  year: string;
  className?: string;
}) {
  return (
    <span className={cn("num-base num-date", className)}>
      {day}
      <span className="num-sep" aria-hidden="true" />
      {month}
      <span className="num-sep" aria-hidden="true" />
      {year}
    </span>
  );
}
