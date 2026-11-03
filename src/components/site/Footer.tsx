import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";
import { navLinks } from "@/content/navigation";
import { useI18n } from "@/lib/i18n";

/**
 * Quiet continuation of the final chapter. Only verified destinations:
 * contacts, social accounts, legal pages and store badges are added when
 * the Albastini team supplies them.
 */
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="on-dark bg-alba-ink text-alba-paper">
      <div className="shell border-t border-alba-paper/20 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Logo size={52} />
            <div>
              <p className="display-xl text-2xl">{t("brand.tagline")}</p>
              <p className="mt-1 text-base text-alba-paper/80">{t("footer.tagline")}</p>
            </div>
          </div>
          <nav
            aria-label={t("nav.footer")}
            className="grid grid-cols-2 gap-x-10 gap-y-2 sm:flex sm:gap-8"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="label py-2 text-alba-paper/85 decoration-2 underline-offset-8 hover:text-alba-paper hover:underline"
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-alba-paper/75">
            © {new Date().getFullYear()} Albastini. {t("footer.rights")}
          </p>
          <LanguageToggle onDark />
        </div>
      </div>
    </footer>
  );
}
