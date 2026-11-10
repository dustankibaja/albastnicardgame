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
