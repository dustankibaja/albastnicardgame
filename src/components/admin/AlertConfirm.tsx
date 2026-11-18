import { useId, useRef, useState, type ReactNode } from "react";

/** All modal styles live in the scanned admin source, never the excluded UI kit. */
export function AlertConfirm({
  trigger,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void | boolean | Promise<void | boolean>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const result = await onConfirm();
      if (result === false) setError("The record was not deleted. Please try again.");
      else dialog.current?.close();
    } catch {
      setError("The record could not be deleted. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <span
        onClick={() => {
          setError(null);
          dialog.current?.showModal();
        }}
      >
        {trigger}
      </span>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-xl border-2 border-alba-ink bg-alba-paper p-6 text-alba-ink shadow-xl backdrop:bg-black/70"
      >
        <div className="grid gap-5">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <p id={bodyId} className="text-base">
            {body}
          </p>
          {error ? (
            <p role="alert" className="font-bold">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => dialog.current?.close()}
              className="min-h-11 border-2 border-alba-ink px-5 font-bold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirm()}
              className="min-h-11 border-2 border-alba-ink bg-alba-gold px-5 font-bold disabled:opacity-50"
            >
              {busy ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function AdminField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: ReactNode;
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
