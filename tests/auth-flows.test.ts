import { test } from "node:test";
import assert from "node:assert/strict";
import {
  signOutSession,
  loginPageAction,
  resolveAdminStatus,
  type ClientLike,
} from "../src/lib/admin/auth-core";

function client(opts: {
  signOutError?: unknown;
  signOutThrows?: boolean;
  user?: { id: string } | null;
  adminRow?: { display_name: string } | null;
}) {
  const calls: string[] = [];
  const c: ClientLike = {
    auth: {
      getUser: async () => ({ data: { user: opts.user ?? null }, error: null }),
      signInWithPassword: async () => ({ error: null }),
      signOut: async () => {
        calls.push("signOut");
        if (opts.signOutThrows) throw new Error("network");
        return { error: opts.signOutError ?? null };
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: opts.adminRow ?? null, error: null }) }),
      }),
    }),
  };
  return { c, calls };
}

// ---- logout ----
test("failed sign-out is reported as a failure, never as success", async () => {
  const { c } = client({ signOutError: { message: "boom" } });
  assert.deepEqual(await signOutSession(c), { ok: false, reason: "failed" });
});
test("a sign-out that throws is also a failure", async () => {
  const { c } = client({ signOutThrows: true });
  assert.deepEqual(await signOutSession(c), { ok: false, reason: "failed" });
});
test("successful sign-out is reported as success only after the service confirms it", async () => {
  const { c, calls } = client({});
  assert.deepEqual(await signOutSession(c), { ok: true });
  assert.deepEqual(calls, ["signOut"]);
});

// ---- login page decisions ----
test("admin session on the login page -> redirect to the dashboard", () => {
  assert.deepEqual(loginPageAction({ kind: "admin", userId: "u", email: null, displayName: "O" }), {
    kind: "redirect-admin",
  });
});
test("forbidden (signed in, not admin) on the login page -> clear the session and deny", () => {
  assert.deepEqual(loginPageAction({ kind: "forbidden", email: "x@y.co" }), {
    kind: "clear-session-and-deny",
  });
});
test("anonymous on the login page -> show the login form", () => {
  assert.deepEqual(loginPageAction({ kind: "anonymous" }), {
    kind: "show-login",
    session: "anonymous",
  });
});
test("unconfigured and unavailable show explicit login states, not a redirect", () => {
  assert.deepEqual(loginPageAction({ kind: "unconfigured" }), {
    kind: "show-login",
    session: "unconfigured",
  });
  assert.deepEqual(loginPageAction({ kind: "unavailable" }), {
    kind: "show-login",
    session: "unavailable",
  });
});

// ---- after logout, the admin must be inaccessible ----
test("after logout the same client resolves as anonymous (admin access ends)", async () => {
  const signedOut = client({ user: null });
  assert.deepEqual(await resolveAdminStatus(signedOut.c), { kind: "anonymous" });
});
test("a forbidden user never resolves to admin, even with a valid session", async () => {
  const f = client({ user: { id: "u9" }, adminRow: null });
  assert.equal((await resolveAdminStatus(f.c)).kind, "forbidden");
});
