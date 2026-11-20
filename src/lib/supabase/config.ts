/*
 * Supabase configuration. Only PUBLIC values are read here (URL and publishable key).
 * Missing values produce an explicit "unconfigured" state. Nothing is faked.
 */
export type SupabasePublicConfig = { url: string; publishableKey: string };

export function readSupabaseConfig(
  env: Record<string, string | undefined> = import.meta.env as Record<string, string | undefined>,
): SupabasePublicConfig | null {
  const url = env["VITE_SUPABASE_URL"]?.trim();
  const publishableKey = env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim();
  if (!url || !publishableKey) return null;
  if (
    !/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(url) &&
    !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(url)
  ) {
    return null; // refuse anything that is not a Supabase project URL (or local dev)
  }
  return { url: url.replace(/\/$/, ""), publishableKey };
}
