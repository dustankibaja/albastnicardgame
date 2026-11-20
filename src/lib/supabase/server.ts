import "@tanstack/react-start/server-only";
import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { readSupabaseConfig } from "./config";

/** Cookie options as the TanStack server helper expects them (derived, not imported). */
type SetCookieOptions = Parameters<typeof setCookie>[2];

/*
 * Server Supabase client bound to the CURRENT request's cookies (TanStack Start
 * server primitives). Uses the public publishable key only. Never a service-role key.
 * Returns null when the project is not configured.
 */
export function createSupabaseServerClient() {
  const config = readSupabaseConfig(process.env as Record<string, string | undefined>);
  if (!config) return null;
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookies) {
        for (const { name, value, options } of cookies) {
          setCookie(name, value, options as SetCookieOptions);
        }
      },
    },
  });
}
