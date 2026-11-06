import { useCallback, useEffect, useRef, useState } from "react";
import { navAnchors, navSceneThemes, type NavTheme } from "./scenes";
import { useActiveSection } from "@/hooks/use-active-scene";
import { useI18n } from "@/lib/i18n";
import { DownloadButton } from "@/components/site/DownloadButton";
import { LanguageToggle } from "@/components/site/LanguageToggle";

/*
 * ONE navigation object. It adapts to the scene by changing its theme
 * attribute; it is never unmounted or re-created per scene.
 * (M1 step 1: smallest version — theme + active section, no marker yet.)
 */
/*
 * KNOWN TRADE-OFF (M1): "Physical cards" becomes active only once its section
 * reaches the top of the viewport. The Competition section is ~2000px tall, so
 * the cards section is a long way below the bar for most of the page; it is
 * active for the final stretch and at the end of the page (verified). The
 * alternative — activating early — would highlight a section the visitor has
 * not reached yet, which is worse. Revisit if the Competition scene is split.
 *
 * The scene changes when a section's TOP edge reaches the nav's bottom edge,
 * which is when a visitor perceives "I've arrived here". We take the LAST
 * section whose top has passed that line, so the boundary is crossed exactly
 * once, in document order, regardless of section heights or gaps between them.
 */
function sceneAt(els: HTMLElement[]): string | null {
  // A section counts as arrived once its top is within the navigation's own
  // height of the viewport top. The page has an ~80px separator between
  // sections; a threshold of the nav height absorbs it exactly, while a section
  // still well below the bar (e.g. the next section, a full viewport away) cannot win.
  const navH = document.querySelector(".scene-nav")?.getBoundingClientRect().height ?? 76;
  const line = navH + 8;
  let winner: string | null = null;
  for (const e of els) {
    if (e.getBoundingClientRect().top <= line) winner = e.id;
  }
  return winner;
}

export function SceneNav() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<NavTheme>("hero");
  const navHeight = 64;
  const active = useActiveSection(
    navAnchors.map((a) => a.id),
    navHeight,
  );
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const [markerX, setMarkerX] = useState<number | null>(null);
  const markerStyle = markerX == null ? { opacity: 0 } : { transform: `translateX(${markerX}px)` };

  // Measure the active link and place the marker under its centre.
  useEffect(() => {
    const list = linksRef.current;
    if (!list || !active) return;
    const link = list.querySelector<HTMLElement>('[aria-current="true"]');
    if (!link) return;
    const measure = () => {
      const lr = list.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      setMarkerX(r.left - lr.left + r.width / 2 - 5);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, t]);

  // The scene is decided by the section at the top of the viewport, not by the
  // last nav link clicked. Scene sections are observed directly.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ids = Object.keys(navSceneThemes);
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const top = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) top.set(e.target.id, e.boundingClientRect.top);
        // The scene is the section that spans the nav band (top ≤ band ≤ bottom).
        const winner = sceneAt(els);
        if (winner) setTheme(navSceneThemes[winner]!);
      },
      { rootMargin: "0px", threshold: [0, 1] },
    );
    els.forEach((e) => obs.observe(e));
    const onScroll = () => {
      const winner = sceneAt(els);
      if (winner) setTheme(navSceneThemes[winner]!);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // While the menu is open: focus enters it, Tab/Shift+Tab stay inside it,
  // Escape closes it, and the page behind does not scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    const items = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    items()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;
      const current = document.activeElement;
      if (e.shiftKey && (current === first || !panel?.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !panel?.contains(current))) {
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
  }, [menuOpen, closeMenu]);

  return (
    <header
      ref={navRef as never}
      data-scene={theme}
      className="scene-nav fixed inset-x-0 top-0 z-50"
    >
      <div className="scene-nav-bar shell">
        <a href="#top" className="scene-nav-logo" aria-label={t("nav.home")}>
          <img src="/favicon.png" alt="" width="32" height="32" />
        </a>
        <nav aria-label={t("nav.primary")} className="scene-nav-links" ref={linksRef as never}>
          {navAnchors.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              aria-current={active === a.id ? "true" : undefined}
              className="scene-nav-link"
            >
              {t(a.key)}
            </a>
          ))}
          {/* ONE 11-point marker, shared by every link. It SLIDEs to the active item. */}
          <span className="scene-nav-marker" aria-hidden="true" style={markerStyle} />
        </nav>
        <div className="scene-nav-tools">
          <LanguageToggle className="scene-nav-lang" />
          <DownloadButton size="sm" className="scene-nav-cta">
            {t("cta.app")}
          </DownloadButton>
          <button
            ref={triggerRef}
            type="button"
            className="scene-nav-trigger"
            aria-label={t("nav.menu")}
            aria-expanded={menuOpen}
            aria-controls="scene-menu"
            onClick={() => setMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div
          id="scene-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.menuTitle")}
          data-scene={theme}
          className="scene-menu"
        >
          <div className="scene-menu-top shell">
            <img src="/favicon.png" alt={t("nav.home")} width="40" height="40" />
            <button
              type="button"
              className="scene-menu-close"
              aria-label={t("nav.closeMenu")}
              onClick={() => closeMenu(true)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label={t("nav.primary")} className="scene-menu-links shell">
            {navAnchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                aria-current={active === a.id ? "true" : undefined}
                className="scene-menu-link"
                onClick={() => closeMenu(false)}
              >
                <span className="scene-menu-mark" aria-hidden="true">
                  <svg viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18.6" />
                    <circle cx="20" cy="20" r="12.6" />
                  </svg>
                </span>
                {t(a.key)}
              </a>
            ))}
          </nav>
          <div className="scene-menu-foot shell">
            <LanguageToggle className="scene-menu-lang" onDark />
            <DownloadButton size="lg" className="scene-menu-cta" onClick={() => closeMenu(false)}>
              {t("cta.app")}
            </DownloadButton>
            <p className="scene-menu-phrase">{t("brand.tagline")}</p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
