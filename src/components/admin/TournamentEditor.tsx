import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listTournaments,
  saveTournament,
  type TournamentRow,
} from "@/lib/admin/tournaments.functions";
import { tournamentSchema, SITE_TIMEZONE } from "@/lib/admin/schemas";
import { previewEastAfrica, splitEastAfricaIso, toEastAfricaIso } from "@/lib/admin/format";
import { AlbaButton } from "@/components/site/AlbaButton";
import { SaveStatus, type SaveState } from "./SaveStatus";

type Draft = {
  tournamentNumber: string;
  title: string;
  date: string;
  time: string;
  status: string;
  registrationMethod: "app" | "web";
  registrationUrl: string;
  published: boolean;
};

function draftFrom(t: TournamentRow): Draft {
  const parts = t.startsAt ? splitEastAfricaIso(t.startsAt) : { date: "", time: "" };
  return {
    tournamentNumber: String(t.tournamentNumber),
    title: t.title,
    date: parts.date,
    time: parts.time,
    status: t.status,
    registrationMethod: t.registrationMethod,
    registrationUrl: t.registrationUrl ?? "",
    published: t.published,
  };
}

export function TournamentEditor() {
  const list = useServerFn(listTournaments);
  const save = useServerFn(saveTournament);
  const [rows, setRows] = useState<TournamentRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  async function load() {
    setLoadError(null);
    const r = await list();
    if (!r.ok) {
      setLoadError(r.error);
      return;
    }
    setRows(r.data);
    setSelectedId((cur) => cur ?? r.data[0]?.id ?? null);
  }
  useEffect(() => {
    void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    const row = rows?.find((r) => r.id === selectedId);
    if (row) {
      setDraft(draftFrom(row));
      setErrors({});
      setState({ kind: "idle" });
    }
  }, [rows, selectedId]);

  if (loadError) return <Message tone="error">{loadError}</Message>;
  if (rows === null) return <Message>Loading tournaments…</Message>;
  if (rows.length === 0)
    return (
      <Message>
        No tournaments exist yet. Tournaments are created by the owner in the database.
      </Message>
    );
  if (!draft) return null;

  const preview = draft.date && draft.time ? toEastAfricaIso(draft.date, draft.time) : null;
  const previewText = preview ? previewEastAfrica(preview) : null;
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    const startsAt = draft!.date && draft!.time ? toEastAfricaIso(draft!.date, draft!.time) : null;
    const candidate = {
      tournamentNumber: Number(draft!.tournamentNumber),
      title: draft!.title,
      startsAt,
      timezone: SITE_TIMEZONE,
      status: draft!.status,
      registrationMethod: draft!.registrationMethod,
      registrationUrl:
        draft!.registrationMethod === "web" && draft!.registrationUrl.trim()
          ? draft!.registrationUrl.trim()
          : null,
      playMode: "on_app" as const,
      published: draft!.published,
    };
    const parsed = tournamentSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0] ?? "form")] = issue.message;
      setErrors(next);
      setState({ kind: "error", message: "Check the highlighted fields." });
      return;
    }
    setErrors({});
    setState({ kind: "saving" });
    const result = await save({ data: { id: selectedId, values: parsed.data } });
    if (!result.ok) {
      setState({ kind: "error", message: result.error });
      return;
    }
    setState({ kind: "saved" });
    await load();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <div>
        <p className="label">Tournaments</p>
        <ul className="mt-3 grid gap-2">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelectedId(r.id)}
                aria-current={r.id === selectedId ? "true" : undefined}
                className="flex min-h-11 w-full items-center justify-between border-2 border-alba-ink px-3 text-left font-bold aria-[current=true]:bg-alba-gold"
              >
                <span>Tournament #{r.tournamentNumber}</span>
                <span className="text-xs uppercase">{r.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="grid max-w-2xl gap-5"
        aria-label="Tournament details"
      >
        <Field id="t-number" label="Tournament number" error={errors["tournamentNumber"]}>
          <input
            id="t-number"
            type="number"
            min={1}
            inputMode="numeric"
            className="alba-field"
            value={draft.tournamentNumber}
            onChange={(e) => set("tournamentNumber", e.target.value)}
            aria-invalid={!!errors["tournamentNumber"]}
          />
        </Field>
        <Field id="t-title" label="Title" error={errors["title"]}>
          <input
            id="t-title"
            className="alba-field"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            aria-invalid={!!errors["title"]}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="t-date" label="Date" error={errors["startsAt"]}>
            <input
              id="t-date"
              type="date"
              className="alba-field"
              value={draft.date}
              onChange={(e) => set("date", e.target.value)}
              aria-invalid={!!errors["startsAt"]}
            />
          </Field>
          <Field id="t-time" label="Start time (East Africa)" error={undefined}>
            <input
              id="t-time"
              type="time"
              className="alba-field"
              value={draft.time}
              onChange={(e) => set("time", e.target.value)}
            />
          </Field>
        </div>
        <p className="text-sm">
          Timezone: <strong>{SITE_TIMEZONE}</strong>
          {previewText ? (
            <>
              {" "}
              · Public display: <strong>{previewText.date}</strong>,{" "}
              <strong>{previewText.time}</strong>
            </>
          ) : null}
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="t-status" label="Status" error={errors["status"]}>
            <select
              id="t-status"
              className="alba-field"
              value={draft.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
          <Field id="t-reg" label="Registration" error={undefined}>
            <select
              id="t-reg"
              className="alba-field"
              value={draft.registrationMethod}
              onChange={(e) => set("registrationMethod", e.target.value as "app" | "web")}
            >
              <option value="app">Through the Albastini app</option>
              <option value="web">Web link</option>
            </select>
          </Field>
        </div>
        {draft.registrationMethod === "web" ? (
          <Field id="t-url" label="Registration link (https://)" error={errors["registrationUrl"]}>
            <input
              id="t-url"
              type="url"
              className="alba-field"
              value={draft.registrationUrl}
              onChange={(e) => set("registrationUrl", e.target.value)}
              aria-invalid={!!errors["registrationUrl"]}
            />
          </Field>
        ) : null}
        <p className="text-sm">
          Play mode: <strong>On the app</strong>
        </p>
        <label className="flex min-h-11 items-center gap-3 font-bold">
          <input
            type="checkbox"
            className="size-5"
            checked={draft.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Published on the website
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <AlbaButton type="submit" size="lg" disabled={state.kind === "saving"}>
            Save tournament
          </AlbaButton>
          <SaveStatus state={state} />
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-bold">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Message({ children, tone }: { children: React.ReactNode; tone?: "error" }) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className="border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm"
    >
      {children}
    </p>
  );
}
