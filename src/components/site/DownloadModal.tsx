import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { appStoreLinks } from "@/content/links";
import { useI18n } from "@/lib/i18n";

type Ctx = { openDownload: () => void };
const DownloadContext = createContext<Ctx>({ openDownload: () => {} });

export function useDownload() {
  return useContext(DownloadContext);
}

/** One shared download dialog for the whole page (previously one per button). */
export function DownloadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const openDownload = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to whatever opened the dialog.
    requestAnimationFrame(() => returnFocus.current?.focus());
  }, []);

  const value = useMemo(() => ({ openDownload }), [openDownload]);

  return (
    <DownloadContext.Provider value={value}>
      {children}
      <DownloadModal open={open} onClose={close} />
    </DownloadContext.Provider>
  );
}

function DownloadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep focus inside the dialog.
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-alba-ink/80" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-title"
        aria-describedby="download-body"
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("modal.close")}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" aria-hidden />
        </button>

        <h2 id="download-title" className="display-xl pr-10 text-2xl leading-[0.95] sm:text-3xl">
          {t("modal.title")}
        </h2>
        <p id="download-body" className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("modal.body")}
        </p>

        <div className="mt-8 grid gap-3">
          {appStoreLinks.ios.url ? (
            <a
              href={appStoreLinks.ios.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-alba-ink px-6 py-4 font-display font-extrabold uppercase tracking-[0.1em] text-alba-paper"
            >
              <AppleIcon className="size-5" />
              {t("modal.ios")}
            </a>
          ) : null}
          {appStoreLinks.android.url ? (
            <a
              href={appStoreLinks.android.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-alba-ink px-6 py-4 font-display font-extrabold uppercase tracking-[0.1em] text-alba-paper"
            >
              <PlayIcon className="size-5" />
              {t("modal.android")}
            </a>
          ) : null}
          {/* Empty state: no store destination available — say so, never a dead button. */}
          {!appStoreLinks.ios.url && !appStoreLinks.android.url ? (
            <p className="rounded-2xl border-2 border-alba-ink/15 p-5 text-base">
              {t("modal.none")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.05 20.28c-.98 1.4-2.04 2.4-3.32 2.4-1.28 0-2.04-.84-3.48-.84-1.48 0-2.24.84-3.52.84-1.48 0-2.6-1.4-3.64-2.96C1.8 16.8.6 12.84.6 9.52c0-5.32 3.44-8.16 6.84-8.16 1.8 0 3.32 1.2 4.44 1.2 1.08 0 2.8-1.28 4.88-1.28 2 0 3.44.92 4.48 2.08-3.92 2.2-3.24 8.84.88 10.56-.56 1.96-1.72 4.04-3.08 5.36zM12.04 2.4c.72-1 1.28-2.12 1.08-3.4-1.16.08-2.52.8-3.32 1.76-.64.76-1.2 1.96-1 3.2 1.24.12 2.52-.68 3.24-1.56z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3.609 1.814 20.91 12.021 3.61 22.186a.996.996 0 0 1-1.51-.86V2.674a1 1 0 0 1 1.51-.86z" />
    </svg>
  );
}
