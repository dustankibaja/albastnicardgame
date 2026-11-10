import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseConfig } from "./config";

/*
 * Browser Supabase client. Public values only. Used for session-aware UI reads
 * only; admin decisions are always made on the server (see admin/auth.functions.ts).
 */
export function createSupabaseBrowserClient() {
  const config = readSupabaseConfig();
  if (!config) return null;
  return createBrowserClient(config.url, config.publishableKey);
}
