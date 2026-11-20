import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAdminSession, signOutAdmin } from "@/lib/admin/auth.functions";
import { getOverview } from "@/lib/admin/overview.functions";

export const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "tournament", label: "Tournament" },
  { id: "winners", label: "Winners" },
  { id: "shop", label: "Shop" },
  { id: "how-to-play", label: "How to Play" },
  { id: "settings", label: "Settings" },
] as const;

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin — Albastini" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  validateSearch: (search: Record<string, unknown>): { section?: string | undefined } => ({
    section: typeof search["section"] === "string" ? search["section"] : undefined,
  }),
  beforeLoad: async () => {
    // Server-side gate. Runs before any protected data is produced or sent.
    const session = await getAdminSession();
    if (session.kind === "anonymous") throw redirect({ to: "/admin/login" });
    if (session.kind === "forbidden") {
      await signOutAdmin();
      throw redirect({ to: "/admin/login", search: { error: "not-authorized" } });
    }
    return { session };
  },
  loader: async ({ context }) => {
    if (context.session.kind !== "admin") return { overview: null, error: null };
    try {
      return { overview: await getOverview(), error: null };
    } catch {
      return {
        overview: null,
        error: "Admin data is unavailable. Check the Supabase connection and try again.",
      };
    }
  },
});
