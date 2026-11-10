import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminSession, signInAdmin } from "@/lib/admin/auth.functions";
import { loginSchema } from "@/lib/admin/schemas";
import { AlbaButton } from "@/components/site/AlbaButton";

type LoginError = "not-authorized" | undefined;

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search: Record<string, unknown>): { error?: LoginError } => ({
    error: search["error"] === "not-authorized" ? "not-authorized" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin sign in — Albastini" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const session = await getAdminSession();
    if (session.kind === "admin") throw redirect({ to: "/admin" });
    return { session };
  },
  component: LoginPage,
});

const MESSAGES = {
  "invalid-credentials": "Email or password is incorrect.",
  "not-authorized": "This account is not authorized to manage Albastini.",
  unavailable: "Sign-in is unavailable right now. Try again shortly.",
  unconfigured:
    "Admin is not connected to the database yet. Set the Supabase environment variables, then reload.",
} as const;

function LoginPage() {
  const router = useRouter();
  const { error: searchError } = Route.useSearch();
  const { session } = Route.useRouteContext();
  const signIn = useServerFn(signInAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(
    searchError === "not-authorized" ? MESSAGES["not-authorized"] : null,
  );
  const [busy, setBusy] = useState(false);

  const notConfigured = session.kind === "unconfigured";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setFieldError(null);
    setBusy(true);
    try {
      const result = await signIn({ data: parsed.data });
      if (result.ok) {
        await router.navigate({ to: "/admin" });
        return;
      }
      setServerError(MESSAGES[result.reason]);
    } catch {
      setServerError(MESSAGES.unavailable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-alba-paper text-alba-ink">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <p className="label text-alba-blue">Albastini admin</p>
        <h1 className="display-xl type-headline mt-3">Sign in</h1>
        <p className="mt-4 text-base">
          Administrators only. Accounts are created by the Albastini owner.
        </p>

        {notConfigured ? (
          <p role="alert" className="mt-8 border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm">
            {MESSAGES.unconfigured}
          </p>
        ) : null}

        {serverError ? (
          <p role="alert" className="mt-8 border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm">
            {serverError}
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-8 grid gap-5"
          aria-describedby={fieldError ? "login-error" : undefined}
        >
          <div className="grid gap-2">
            <label htmlFor="admin-email" className="label">
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="alba-field"
              aria-invalid={fieldError ? true : undefined}
              disabled={notConfigured}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="admin-password" className="label">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="alba-field"
              disabled={notConfigured}
            />
          </div>
          {fieldError ? (
            <p id="login-error" role="alert" className="text-sm font-bold text-alba-ink">
              {fieldError}
            </p>
          ) : null}
          <div>
            <AlbaButton type="submit" size="lg" disabled={busy || notConfigured}>
              {busy ? "Signing in…" : "Sign in"}
            </AlbaButton>
          </div>
        </form>
      </div>
    </main>
  );
}
