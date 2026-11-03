import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DownloadButton } from "./DownloadButton";
import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";
import { navLinks } from "@/content/navigation";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Transparent over the blue hero, solid white once scrolled.
 * Mobile: full-screen blue overlay menu (focus trapped, Escape closes,
 * background scroll locked, focus returns to the menu button).
 */
export function Navbar() {
  const { t } = useI18n();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButton.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = overlay.current;
    const focusables = () =>
      Array.from(root?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close(true);
      if (e.key !== "Tab") return;
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
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) close(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const dark = !stuck; // over the blue hero

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-[var(--dur-std)]",
          dark
            ? "on-dark bg-transparent text-alba-paper"
            : "bg-alba-paper text-alba-ink shadow-[0_1px_0_rgb(0_0_0/0.08)]",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-3 lg:h-20">
          <a href="#top" aria-label={t("nav.home")} className="rounded-full">
            <Logo size={44} />
          </a>

          <nav aria-label={t("nav.primary")} className="hidden items-center gap-9 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="label py-2 decoration-2 underline-offset-[10px] hover:underline"
              >
                {t(l.key)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle onDark={dark} className="hidden sm:flex" />
            <DownloadButton size="sm" className="hidden min-[375px]:inline-flex">
              <span className="sm:hidden">{t("cta.appShort")}</span>
              <span className="hidden sm:inline">{t("cta.app")}</span>
            </DownloadButton>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("nav.menu")}
              aria-expanded={open}
              aria-controls="site-menu"
              className="grid size-11 place-items-center rounded-full border-2 border-current/30 lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="site-menu"
          ref={overlay}
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.menuTitle")}
          className="on-dark fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-alba-blue text-alba-paper lg:hidden"
        >
          <div className="shell flex h-16 shrink-0 items-center justify-between">
            <a href="#top" aria-label={t("nav.home")} onClick={() => close(false)}>
              <Logo size={44} />
            </a>
            <button
              type="button"
              onClick={() => close(true)}
              aria-label={t("nav.closeMenu")}
              className="grid size-11 place-items-center rounded-full border-2 border-alba-paper/40"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <nav aria-label={t("nav.primary")} className="shell mt-6 flex flex-col">
            {navLinks.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => close(false)}
                className="enter display-xl border-b border-alba-paper/20 py-4 text-[clamp(2.75rem,13vw,4.5rem)]"
                style={{ ["--delay" as string]: `${i * 50}ms` }}
              >
                {t(l.key)}
              </a>
            ))}
          </nav>

          <div className="shell mt-auto flex flex-col gap-6 pb-10 pt-10">
            <LanguageToggle onDark />
            <DownloadButton size="lg" className="w-full" onClick={() => close(false)}>
              {t("cta.app")}
            </DownloadButton>
            <p className="display-xl text-3xl text-alba-gold">{t("brand.tagline")}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
