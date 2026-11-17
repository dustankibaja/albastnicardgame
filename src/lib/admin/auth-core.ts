/*
 * Authorization decisions, framework-free so they can be tested with a fake client.
 * Rules:
 *  - The user is verified with auth.getUser() (checked by Supabase Auth), never by
 *    trusting a session object or cookie contents supplied by the browser.
 *  - Administrator status requires a row in admin_users for that verified UUID.
 *  - A database error is an ERROR, not "not an admin" and not success.
 */
export type AdminStatus =
  | { kind: "anonymous" }
  | { kind: "forbidden"; email: string | null }
  | { kind: "admin"; userId: string; email: string | null; displayName: string };

export type SessionState = AdminStatus | { kind: "unconfigured" } | { kind: "unavailable" };

export class AdminDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminDataError";
  }
}

export type AuthLike = {
  getUser(): Promise<{
    data: { user: { id: string; email?: string | null } | null };
    error: unknown;
  }>;
  signInWithPassword(input: {
    email: string;
    password: string;
  }): Promise<{ error: { status?: number | undefined } | null }>;
  signOut(): Promise<{ error: unknown }>;
};

export type ClientLike = {
  auth: AuthLike;
  from(table: "admin_users"): {
    select(columns: string): {
      eq(
        column: "user_id",
        value: string,
      ): {
        maybeSingle(): Promise<{ data: { display_name: string } | null; error: unknown }>;
      };
    };
  };
};

export async function resolveAdminStatus(client: ClientLike): Promise<AdminStatus> {
  const { data, error } = await client.auth.getUser();
  // Supabase reports a fresh browser with no auth cookie as an error, too.
  // Only that specific case is anonymous; service failures must stay visible.
  if (
    !data.user &&
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "AuthSessionMissingError"
  )
    return { kind: "anonymous" };
  if (error) throw new AdminDataError("Could not verify the session.");
  const user = data.user;
  if (!user) return { kind: "anonymous" };
  const { data: row, error: rowError } = await client
    .from("admin_users")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (rowError) throw new AdminDataError("Could not check administrator access.");
  if (!row) return { kind: "forbidden", email: user.email ?? null };
  return {
    kind: "admin",
    userId: user.id,
    email: user.email ?? null,
    displayName: row.display_name,
  };
}

export type SignInResult =
  { ok: true } | { ok: false; reason: "invalid-credentials" | "not-authorized" | "unavailable" };

/**
 * Sign in, then confirm administrator membership. A signed-in non-admin is signed
 * straight back out, so no session is left behind for an unauthorized account.
 */
export async function signInAsAdmin(
  client: ClientLike,
  email: string,
  password: string,
): Promise<SignInResult> {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    const status = typeof error.status === "number" ? error.status : 0;
    return status >= 400 && status < 500
      ? { ok: false, reason: "invalid-credentials" }
      : { ok: false, reason: "unavailable" };
  }
  let status: AdminStatus;
  try {
    status = await resolveAdminStatus(client);
  } catch {
    await client.auth.signOut();
    return { ok: false, reason: "unavailable" };
  }
  if (status.kind !== "admin") {
    await client.auth.signOut();
    return { ok: false, reason: "not-authorized" };
  }
  return { ok: true };
}

export type SignOutResult = { ok: true } | { ok: false; reason: "failed" };

/**
 * Sign out. Success is reported ONLY when the auth service confirms it. A failure is
 * returned as a failure, so the UI never claims a session was ended when it was not.
 */
export async function signOutSession(client: ClientLike): Promise<SignOutResult> {
  try {
    const { error } = await client.auth.signOut();
    return error ? { ok: false, reason: "failed" } : { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export type LoginPageAction =
  | { kind: "redirect-admin" }
  | { kind: "clear-session-and-deny" }
  | { kind: "show-login"; session: "anonymous" | "unconfigured" | "unavailable" };

/**
 * What the login page should do with the current server-verified session.
 * A forbidden (signed-in, non-admin) session is cleared, never left in place.
 */
export function loginPageAction(status: SessionState): LoginPageAction {
  if (status.kind === "admin") return { kind: "redirect-admin" };
  if (status.kind === "forbidden") return { kind: "clear-session-and-deny" };
  if (status.kind === "unconfigured") return { kind: "show-login", session: "unconfigured" };
  if (status.kind === "unavailable") return { kind: "show-login", session: "unavailable" };
  return { kind: "show-login", session: "anonymous" };
}
