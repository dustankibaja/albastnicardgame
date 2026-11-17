import { createSupabaseServerClient } from "../supabase/server";
import { resolveAdminStatus, AdminDataError } from "./auth-core";
import { asClientLike, type SupabaseServer } from "./server-adapter";

export class AdminAccessError extends Error {
  constructor(message = "This action requires an authorized Albastini administrator.") {
    super(message);
    this.name = "AdminAccessError";
  }
}

/**
 * Every privileged server function starts here: a request-bound client, a verified user
 * (auth.getUser), and an admin_users row. Throws if any step fails. RLS still applies to
 * every query made with the returned client.
 */
export async function requireAdmin(): Promise<SupabaseServer> {
  const client = createSupabaseServerClient();
  if (!client) throw new AdminDataError("Supabase is not configured.");
  const status = await resolveAdminStatus(asClientLike(client));
  if (status.kind !== "admin") throw new AdminAccessError();
  return client;
}

export type MutationResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/** Turn any thrown error into a safe, explicit message. Never leak internals or secrets. */
export function failure(
  error: unknown,
  fallback = "The change could not be saved. Try again.",
): { ok: false; error: string } {
  if (error instanceof AdminAccessError) return { ok: false, error: error.message };
  if (error instanceof AdminDataError)
    return {
      ok: false,
      error: "Admin data is unavailable. Check the Supabase connection and try again.",
    };
  return { ok: false, error: fallback };
}

import type { Q } from "./catalog-core";
/**
 * The mutation cores use a small structural surface that is covered by their tests with a
 * fake client. The real Supabase client implements that surface; this single explicit cast
 * is the only place the boundary is crossed (the full client type is too deep to infer).
 */
export function asCoreQuery(client: SupabaseServer): Q {
  return client as unknown as Q;
}
