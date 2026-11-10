export type SaveState =
  { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

/** Honest save feedback: 'Saving…', 'Saved', or the real error. Announced to assistive tech. */
export function SaveStatus({ state }: { state: SaveState }) {
  if (state.kind === "idle") return null;
  if (state.kind === "saving")
    return (
      <p role="status" aria-live="polite" className="text-sm font-bold">
        Saving…
      </p>
    );
  if (state.kind === "saved")
    return (
      <p role="status" aria-live="polite" className="text-sm font-bold">
        Saved
      </p>
    );
  return (
    <p role="alert" className="text-sm font-bold">
      {state.message}
    </p>
  );
}
