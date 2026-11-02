import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";
import { navLinks } from "@/content/navigation";
import { useI18n } from "@/lib/i18n";

/**
 * Only verified destinations belong here. Contacts, social accounts, legal
 * pages and store badges are deferred until the Albastini team supplies them.
 */
export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-background py-14">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <Logo showTag />
            <p className="mt-4 max-w-xs text-base text-muted-foreground">{t("footer.tagline")}</p>
          </div>

          <nav aria-label={t("nav.primary")} className="flex flex-wrap gap-x-7 gap-y-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="eyebrow py-2 text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
        </div>

        <div aria-hidden className="kanga-rule my-9 h-1 w-full rounded-full" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Albastini. {t("footer.rights")}
          </p>
          <LanguageToggle className="w-fit" />
        </div>
      </div>
    </footer>
  );
}
