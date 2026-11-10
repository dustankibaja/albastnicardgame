import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCountdownEnabled, saveCountdownEnabled } from "@/lib/admin/settings.functions";
import { SaveStatus, type SaveState } from "./SaveStatus";

export function SettingsEditor() {
  const load = useServerFn(getCountdownEnabled);
  const save = useServerFn(saveCountdownEnabled);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  useEffect(() => {
    load().then((r) => (r.ok ? setEnabled(r.data) : setLoadError(r.error)));
  }, [load]);

  if (loadError)
    return (
      <p role="alert" className="border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm">
        {loadError}
      </p>
    );
  if (enabled === null)
    return (
      <p role="status" className="text-sm">
        Loading settings…
      </p>
    );

  async function onToggle(next: boolean) {
    setState({ kind: "saving" });
    const r = await save({ data: { tournamentCountdownEnabled: next } });
    if (!r.ok) {
      setState({ kind: "error", message: r.error });
      return;
    }
    // Show the value the DATABASE confirmed, not the value we tried to write.
    setEnabled(r.data);
    setState({ kind: "saved" });
  }

  return (
    <div className="max-w-2xl">
      <h2 className="display-xl text-2xl">Tournament countdown</h2>
      <p className="mt-3 text-base">
        Shows a live countdown to the next tournament on the website. The date and time (12 December
        2026, 8:00 PM EAT) are shown either way. This setting only controls the countdown.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="font-bold">Countdown is {enabled ? "ON" : "OFF"}</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Tournament countdown"
          disabled={state.kind === "saving"}
          onClick={() => void onToggle(!enabled)}
          className="flex min-h-11 min-w-20 items-center border-2 border-alba-ink px-1 aria-checked:justify-end aria-checked:bg-alba-gold"
        >
          <span className="size-7 border-2 border-alba-ink bg-alba-paper" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4">
        <SaveStatus state={state} />
      </div>
    </div>
  );
}
