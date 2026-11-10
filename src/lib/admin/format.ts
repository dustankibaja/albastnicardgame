/** "Saturday, 12 December 2026, 8:00 PM EAT" shown in the site timezone, for admin display only. */
export function formatAdminDate(iso: string): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(date);
  return `${day}, ${time} EAT`;
}

const DAR = "Africa/Dar_es_Salaam";

/** Combine a calendar date (YYYY-MM-DD) and wall time (HH:mm) in Dar es Salaam into an ISO instant. */
export function toEastAfricaIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  return `${date}T${time}:00+03:00`;
}

/** Split an ISO instant into the Dar es Salaam calendar date and wall time, for form inputs. */
export function splitEastAfricaIso(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DAR,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: DAR,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
  return { date: parts, time };
}

/** Preview lines shown beside the editor: "12 December 2026" and "8:00 PM EAT". */
export function previewEastAfrica(iso: string): { date: string; time: string } {
  return {
    date: new Intl.DateTimeFormat("en-GB", {
      timeZone: DAR,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso)),
    time: `${new Intl.DateTimeFormat("en-US", { timeZone: DAR, hour: "numeric", minute: "2-digit" }).format(new Date(iso))} EAT`,
  };
}
