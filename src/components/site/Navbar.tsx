import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DownloadButton } from "./DownloadButton";
import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";
import { navLinks } from "@/content/navigation";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useI18n();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) menuButton.current?.focus();
  }, []);

  // Mobile menu: Escape closes, background doesn't scroll, focus moves in.
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        stuck || open
          ? "border-b border-border bg-background"
          : "border-b border-transparent bg-background/0",
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
        <a href="#top" className="shrink-0 rounded-md">
          <Logo />
        </a>

        <nav aria-label={t("nav.primary")} className="hidden gap-8 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="eyebrow py-2 text-foreground/80 underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {t(l.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language and app CTA stay reachable at every width. */}
          <LanguageToggle />
          <DownloadButton size="sm" className="hidden min-[375px]:inline-flex">
            <span className="sm:hidden">{t("cta.appShort")}</span>
            <span className="hidden sm:inline">{t("cta.app")}</span>
          </DownloadButton>
          <button
            ref={menuButton}
            type="button"
            onClick={() => (open ? close(true) : setOpen(true))}
            aria-label={open ? t("nav.closeMenu") : t("nav.menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-11 place-items-center rounded-full border border-border lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          ref={panel}
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background px-5 pb-6 pt-2 lg:hidden"
        >
          <nav aria-label={t("nav.primary")} className="flex flex-col">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => close(false)}
                className="display-xl border-b border-border py-4 text-2xl"
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
          <div className="mt-5">
            <DownloadButton className="w-full" onClick={() => close(false)}>
              {t("cta.app")}
            </DownloadButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
