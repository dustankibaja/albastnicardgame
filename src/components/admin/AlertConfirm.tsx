import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-alert-dialog";

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
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const result = await onConfirm();
      if (result === false) setError("The record was not deleted. Please try again.");
      else setOpen(false);
    } catch {
      setError("The record could not be deleted. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          setOpen(next);
          setError(null);
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[1001] grid max-h-[85vh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-xl border-2 border-alba-ink bg-alba-paper p-6 text-alba-ink shadow-xl">
          <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
          <Dialog.Description className="text-base">{body}</Dialog.Description>
          {error ? (
            <p role="alert" className="font-bold">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Dialog.Cancel
              disabled={busy}
              className="min-h-11 border-2 border-alba-ink px-5 font-bold disabled:opacity-50"
            >
              Cancel
            </Dialog.Cancel>
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirm()}
              className="min-h-11 border-2 border-alba-ink bg-alba-gold px-5 font-bold disabled:opacity-50"
            >
              {busy ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
