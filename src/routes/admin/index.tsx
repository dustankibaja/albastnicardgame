import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

// Editors load on demand: ordinary public visitors never download admin editor code.
const TournamentEditor = lazy(() =>
  import("@/components/admin/TournamentEditor").then((m) => ({ default: m.TournamentEditor })),
);
const TutorialEditor = lazy(() =>
  import("@/components/admin/TutorialEditor").then((m) => ({ default: m.TutorialEditor })),
);
const SettingsEditor = lazy(() =>
  import("@/components/admin/SettingsEditor").then((m) => ({ default: m.SettingsEditor })),
);
const WinnersEditor = lazy(() =>
  import("@/components/admin/WinnersEditor").then((m) => ({ default: m.WinnersEditor })),
);
const ShopEditor = lazy(() =>
  import("@/components/admin/ShopEditor").then((m) => ({ default: m.ShopEditor })),
);
import { useServerFn } from "@tanstack/react-start";
import { getAdminSession, signOutAdmin } from "@/lib/admin/auth.functions";
import { getOverview, type OverviewStats } from "@/lib/admin/overview.functions";
import { AlbaButton } from "@/components/site/AlbaButton";
import { formatAdminDate } from "@/lib/admin/format";

const SECTIONS = [
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
  component: AdminDashboard,
});

function AdminDashboard() {
  const { session } = Route.useRouteContext();
  const { overview, error } = Route.useLoaderData();
  const { section = "overview" } = Route.useSearch();
  const router = useRouter();
  const logout = useServerFn(signOutAdmin);
  const [navOpen, setNavOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function onLogout() {
    setLogoutError(null);
    const result = await logout();
    // Navigate away only after the auth service confirmed the sign-out.
    if (!result.ok) {
      setLogoutError("Could not sign out. Check your connection and try again.");
      return;
    }
    await router.navigate({ to: "/admin/login" });
  }

  if (session.kind === "unconfigured") {
    return (
      <SetupState
        title="Admin is not connected yet"
        body="Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then reload. No content is changed until the database is connected."
      />
    );
  }
  if (session.kind === "unavailable") {
    return (
      <SetupState
        title="Admin is unavailable"
        body="Admin data is unavailable. Check the Supabase connection and try again."
      />
    );
  }

  const current = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  return (
    <div className="min-h-screen bg-alba-paper text-alba-ink lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b-2 border-alba-ink bg-alba-ink text-alba-paper lg:min-h-screen lg:border-b-0 lg:border-r-2">
        <div className="flex items-center justify-between px-5 py-4">
          <p className="display-xl text-xl">ALBASTINI ADMIN</p>
          <button
            type="button"
            className="min-h-11 min-w-11 border-2 border-alba-paper px-3 text-sm font-bold lg:hidden"
            aria-expanded={navOpen}
            aria-controls="admin-nav"
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? "Close" : "Menu"}
          </button>
        </div>
        <nav
          id="admin-nav"
          aria-label="Admin sections"
          className={navOpen ? "grid gap-1 px-3 pb-4" : "hidden gap-1 px-3 pb-4 lg:grid"}
        >
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              to="/admin"
              search={{ section: s.id }}
              aria-current={s.id === current.id ? "page" : undefined}
              onClick={() => setNavOpen(false)}
              className="flex min-h-11 items-center px-3 font-bold aria-[current=page]:bg-alba-gold aria-[current=page]:text-alba-ink"
            >
              {s.label}
            </Link>
          ))}
          <div className="mt-6 grid gap-2 border-t border-alba-paper/30 pt-4">
            <Link to="/" className="flex min-h-11 items-center px-3 text-sm underline">
              View website
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-11 items-center px-3 text-left text-sm underline"
            >
              Log out
            </button>
          </div>
        </nav>
      </aside>

      <main className="px-5 py-8 lg:px-10">
        <h1 className="display-xl type-headline">{current.label}</h1>
        {error ? (
          <p role="alert" className="mt-6 border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm">
            {error}
          </p>
        ) : null}
        <div className="mt-8">
          <Suspense
            fallback={
              <p role="status" className="text-sm">
                Loading…
              </p>
            }
          >
            {renderSection(current.id, overview)}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function renderSection(id: (typeof SECTIONS)[number]["id"], overview: OverviewStats | null) {
  if (id === "overview") return <Overview overview={overview} />;
  if (id === "tournament") return <TournamentEditor />;
  if (id === "how-to-play") return <TutorialEditor />;
  if (id === "settings") return <SettingsEditor />;
  if (id === "winners") return <WinnersEditor />;
  return <ShopEditor />;
}

function Overview({ overview }: { overview: OverviewStats | null }) {
  if (!overview) return null;
  const up = overview.upcoming;
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Fact
        label="Next upcoming tournament"
        value={up ? `Tournament #${up.number}` : "None scheduled"}
      />
      <Fact
        label="Date and time"
        value={up?.startsAt ? `${formatAdminDate(up.startsAt)} · ${up.timezone}` : "Not set"}
      />
      <Fact label="Published winners" value={String(overview.publishedWinners)} />
      <Fact label="Published products" value={String(overview.publishedProducts)} />
      <Fact
        label="How to Play (English)"
        value={overview.tutorial ? overview.tutorial.title : "No active tutorial"}
      />
      <Fact label="Countdown on the website" value={overview.countdownEnabled ? "On" : "Off"} />
      <div className="sm:col-span-2">
        <AlbaButton asChildHref="/">View website</AlbaButton>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-alba-ink p-5">
      <p className="label text-alba-blue">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function SetupState({ title, body }: { title: string; body: string }) {
  return (
    <main className="min-h-screen bg-alba-paper p-5 text-alba-ink sm:p-8">
      <h1 className="display-xl type-headline break-words">{title}</h1>
      <p
        role="alert"
        className="mt-6 max-w-prose break-words border-l-4 border-alba-ink bg-alba-gold/30 p-4"
      >
        {body}
      </p>
    </main>
  );
}
