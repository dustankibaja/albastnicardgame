import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listWinners,
  saveWinner,
  deleteWinnerFn,
  moveWinnerFn,
  uploadWinnerImage,
  type WinnerRow,
} from "@/lib/admin/winners.functions";
import { listTournaments, type TournamentRow } from "@/lib/admin/tournaments.functions";
import { winnerSchema, PHOTO_MODES, SUPPORTED_CURRENCIES } from "@/lib/admin/schemas";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/admin/catalog-core";
import { AlbaButton } from "@/components/site/AlbaButton";
import { SaveStatus, type SaveState } from "./SaveStatus";
import { AlertConfirm, AdminField } from "./AlertConfirm";

type Draft = {
  displayName: string;
  placement: string;
  location: string;
  prize: string;
  currency: string;
  photoMode: string;
  sortOrder: number;
  published: boolean;
  imagePath: string | null;
  tournamentId: string;
};

const blank = (tournamentId: string, nextSort: number): Draft => ({
  displayName: "",
  placement: "1",
  location: "",
  prize: "",
  currency: "TZS",
  photoMode: "portrait-cutout",
  sortOrder: nextSort,
  published: false,
  imagePath: null,
  tournamentId,
});

const fromRow = (w: WinnerRow): Draft => ({
  displayName: w.displayName,
  placement: String(w.placement),
  location: w.location,
  prize: String(w.prizeAmount),
  currency: w.currency,
  photoMode: w.photoMode,
  sortOrder: w.sortOrder,
  published: w.published,
  imagePath: w.imagePath,
  tournamentId: w.tournamentId,
});

export function WinnersEditor() {
  const list = useServerFn(listWinners);
  const tournaments = useServerFn(listTournaments);
  const save = useServerFn(saveWinner);
  const remove = useServerFn(deleteWinnerFn);
  const move = useServerFn(moveWinnerFn);
  const upload = useServerFn(uploadWinnerImage);

  const [rows, setRows] = useState<WinnerRow[] | null>(null);
  const [tournamentList, setTournamentList] = useState<TournamentRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const load = useCallback(async () => {
    setLoadError(null);
    const [w, t] = await Promise.all([list(), tournaments()]);
    if (!w.ok) {
      setLoadError(w.error);
      return;
    }
    if (!t.ok) {
      setLoadError(t.error);
      return;
    }
    setTournamentList(t.data);
    setRows(w.data);
  }, [list, tournaments]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadError)
    return (
      <p role="alert" className="border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm">
        {loadError}
      </p>
    );
  if (rows === null)
    return (
      <p role="status" className="text-sm">
        Loading winners…
      </p>
    );

  const defaultTournamentId = tournamentList[0]?.id ?? "";
  const current = rows.find((r) => r.id === selectedId) ?? null;
  const isNew = selectedId === "__new__";

  function startNew() {
    setSelectedId("__new__");
    setDraft(blank(defaultTournamentId, (rows?.length ?? 0) + 1));
    setErrors({});
    setState({ kind: "idle" });
  }

  function select(w: WinnerRow) {
    setSelectedId(w.id);
    setDraft(fromRow(w));
    setErrors({});
    setState({ kind: "idle" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const parsed = winnerSchema.safeParse({
      displayName: draft.displayName,
      placement: Number(draft.placement),
      location: draft.location,
      prizeAmount: Number(draft.prize),
      currency: draft.currency,
      photoMode: draft.photoMode,
      imagePath: draft.imagePath,
      sortOrder: draft.sortOrder,
      published: draft.published,
    });
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
    const result = await save({
      data: {
        id: isNew ? null : selectedId,
        tournamentId: draft.tournamentId,
        values: parsed.data,
      },
    });
    if (!result.ok) {
      setState({ kind: "error", message: result.error });
      return;
    }
    setState({ kind: "saved" });
    setSelectedId(result.data.id);
    await load();
  }

  async function onFile(file: File | undefined) {
    if (!file || !current) return;
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setState({ kind: "error", message: "Upload a PNG, JPEG or WebP image." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setState({ kind: "error", message: "The image must be 5 MB or smaller." });
      return;
    }
    setState({ kind: "saving" });
    try {
      const r = await upload({ data: { id: current.id, mime: file.type, size: file.size } });
      if (!r.ok) {
        setState({ kind: "error", message: r.error });
        return;
      }
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Image upload is not configured.");
      const sent = await client.storage
        .from("site-media")
        .uploadToSignedUrl(r.data.path, r.data.token, file, { contentType: file.type });
      if (sent.error) throw new Error("Upload failed. Check your connection and try again.");
      setDraft((d) => (d ? { ...d, imagePath: r.data.path } : d));
      setState({ kind: "idle" });
    } catch {
      setState({
        kind: "error",
        message: "The image could not be uploaded. Try a PNG, JPEG or WebP up to 5 MB.",
      });
    }
  }

  async function onDelete(id: string): Promise<boolean> {
    try {
      const r = await remove({ data: { id } });
      if (!r.ok) {
        setState({ kind: "error", message: r.error });
        return false;
      }
      setSelectedId(null);
      setDraft(null);
      setState({ kind: "idle" });
      await load();
      return true;
    } catch {
      setState({ kind: "error", message: "The winner could not be deleted. Please try again." });
      return false;
    }
  }

  async function onMove(w: WinnerRow, direction: "up" | "down") {
    const r = await move({ data: { id: w.id, tournamentId: w.tournamentId, direction } });
    if (!r.ok) {
      setState({ kind: "error", message: r.error });
      return;
    }
    await load();
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <section aria-labelledby="winners-list-h">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="winners-list-h" className="label">
            Champions
          </h2>
          <AlbaButton
            size="sm"
            type="button"
            onClick={startNew}
            disabled={!tournamentList.length || state.kind === "saving"}
          >
            Add winner
          </AlbaButton>
        </div>
        {!tournamentList.length ? (
          <p className="mt-4 text-sm">
            Create a tournament in the Tournaments tab first, then add its winners and photos here.
          </p>
        ) : null}
        {rows.length === 0 ? (
          <p className="mt-4 text-sm">No winners yet. Add the first winner.</p>
        ) : null}
        <ol className="mt-4 grid gap-3">
          {rows.map((w, i) => (
            <li
              key={w.id}
              className="grid gap-2 border-2 border-alba-ink p-3"
              aria-current={w.id === selectedId ? "true" : undefined}
            >
              <button
                type="button"
                onClick={() => select(w)}
                className="min-h-11 text-left font-bold"
              >
                {w.placement}. {w.displayName}
                <span className="block text-sm font-normal">
                  {w.location} · {w.prizeAmount.toLocaleString("en-US")} {w.currency}
                  {w.published ? "" : " · Hidden"}
                </span>
              </button>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-11 min-w-11 border-2 border-alba-ink px-3 disabled:opacity-40"
                  disabled={i === 0}
                  onClick={() => void onMove(w, "up")}
                  aria-label={`Move ${w.displayName} up`}
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  className="min-h-11 min-w-11 border-2 border-alba-ink px-3 disabled:opacity-40"
                  disabled={i === rows.length - 1}
                  onClick={() => void onMove(w, "down")}
                  aria-label={`Move ${w.displayName} down`}
                >
                  ↓ Down
                </button>
                <AlertConfirm
                  trigger={
                    <button
                      type="button"
                      className="min-h-11 border-2 border-alba-ink px-3 font-bold"
                    >
                      Delete
                    </button>
                  }
                  title={`Delete ${w.displayName}?`}
                  body="This removes the winner from the database. It cannot be undone."
                  confirmLabel="Delete winner"
                  onConfirm={() => onDelete(w.id)}
                />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {draft ? (
        <form
          onSubmit={onSubmit}
          noValidate
          className="grid gap-5"
          aria-label={isNew ? "New winner" : `Edit ${current?.displayName ?? "winner"}`}
        >
          <AdminField id="w-name" label="Display name" error={errors["displayName"]}>
            <input
              id="w-name"
              className="alba-field"
              value={draft.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              aria-invalid={!!errors["displayName"]}
            />
          </AdminField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField id="w-place" label="Rank" error={errors["placement"]}>
              <select
                id="w-place"
                className="alba-field"
                value={draft.placement}
                onChange={(e) => set("placement", e.target.value)}
              >
                <option value="1">1st</option>
                <option value="2">2nd</option>
                <option value="3">3rd</option>
              </select>
            </AdminField>
            <AdminField id="w-tour" label="Tournament" error={undefined}>
              <select
                id="w-tour"
                className="alba-field"
                value={draft.tournamentId}
                onChange={(e) => set("tournamentId", e.target.value)}
              >
                {tournamentList.map((t) => (
                  <option key={t.id} value={t.id}>
                    Tournament #{t.tournamentNumber}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <AdminField id="w-loc" label="Location" error={errors["location"]}>
            <input
              id="w-loc"
              className="alba-field"
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              aria-invalid={!!errors["location"]}
            />
          </AdminField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField id="w-prize" label="Prize" error={errors["prizeAmount"]}>
              <input
                id="w-prize"
                inputMode="numeric"
                className="alba-field"
                value={draft.prize}
                onChange={(e) => set("prize", e.target.value)}
                aria-invalid={!!errors["prizeAmount"]}
              />
            </AdminField>
            <AdminField id="w-cur" label="Currency" error={undefined}>
              <select
                id="w-cur"
                className="alba-field"
                value={draft.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <AdminField id="w-mode" label="Photo mode" error={undefined}>
            <select
              id="w-mode"
              className="alba-field"
              value={draft.photoMode}
              onChange={(e) => set("photoMode", e.target.value)}
            >
              {PHOTO_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </AdminField>
          <label className="flex min-h-11 items-center gap-3 font-bold">
            <input
              type="checkbox"
              className="size-5"
              checked={draft.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Published on the website
          </label>
          <p role="status" className="border-l-4 border-alba-blue bg-alba-gold/20 p-3 text-sm">
            {current?.published
              ? "This winner is published. Save changes, then refresh View website to see updates."
              : "This winner is a draft and is not visible on the website. Tick Published on the website and Save winner to publish it."}{" "}
            The website shows winners from the latest published, completed tournament with a date.
          </p>
          <div className="grid gap-2">
            <p className="label">Photo</p>
            <p className="text-sm">
              {draft.imagePath
                ? "Image uploaded. Save this record to apply it to the website."
                : "No photo stored. The site uses its verified photo until one is uploaded."}
            </p>
            {draft.imagePath ? (
              <img
                src={
                  createSupabaseBrowserClient()
                    ?.storage.from("site-media")
                    .getPublicUrl(draft.imagePath).data.publicUrl
                }
                alt="Selected image preview"
                className="h-40 max-w-full object-contain"
              />
            ) : null}
            {!isNew && current ? (
              <input
                disabled={state.kind === "saving"}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                aria-label="Upload winner photo"
                className="min-h-11"
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
            ) : (
              <p className="text-sm">
                Save the winner first to enable image upload, then save again to apply the photo.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <AlbaButton type="submit" size="lg" disabled={state.kind === "saving"}>
              Save winner
            </AlbaButton>
            <SaveStatus state={state} />
          </div>
        </form>
      ) : (
        <p className="text-sm">Select a winner to edit, or add a new one.</p>
      )}
    </div>
  );
}
