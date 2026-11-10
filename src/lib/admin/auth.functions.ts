import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { createSupabaseServerClient } from "../supabase/server";
import {
  resolveAdminStatus,
  signInAsAdmin,
  AdminDataError,
  type SessionState,
  type SignInResult,
} from "./auth-core";
import { asClientLike } from "./server-adapter";
import { loginSchema } from "./schemas";

/* Admin responses are per-user and must never be cached or shared. */
function noStore() {
  setResponseHeader("Cache-Control", "private, no-store");
}

/** Who is making this request, decided on the server. */
export const getAdminSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionState> => {
    noStore();
    const client = createSupabaseServerClient();
    if (!client) return { kind: "unconfigured" };
    try {
      return await resolveAdminStatus(asClientLike(client));
    } catch (error) {
      if (error instanceof AdminDataError) return { kind: "unavailable" };
      throw error;
    }
  },
);

export const signInAdmin = createServerFn({ method: "POST" })
  .validator((input: unknown) => loginSchema.parse(input))
  .handler(async ({ data }): Promise<SignInResult | { ok: false; reason: "unconfigured" }> => {
    noStore();
    const client = createSupabaseServerClient();
    if (!client) return { ok: false, reason: "unconfigured" };
    return signInAsAdmin(asClientLike(client), data.email, data.password);
  });

export const signOutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  noStore();
  const client = createSupabaseServerClient();
  if (client) await client.auth.signOut();
  return { ok: true as const };
});
