import { createFileRoute } from "@tanstack/react-router";
import { DownloadProvider } from "@/components/site/DownloadModal";
import { Footer } from "@/components/site/Footer";
import { PhysicalCardsSection } from "@/components/site/PhysicalCardsSection";
import { SceneNav } from "@/components/nav/SceneNav";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { site } from "@/content/site";

/*
 * SHOP. The Albastini shop, built so further products can be added when they
 * exist. Today it holds exactly one subsection: Physical Cards. Nothing else is
 * listed: no invented merchandise, accessories or decks.
 */
export const Route = createFileRoute("/shop")({
  head: () => {
    const title = "Shop — Albastini";
    const description =
      "Shop Albastini. Physical Albastini cards: card availability updates coming soon.";
    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: site.locale },
      { name: "twitter:card", content: "summary" },
    ];
    if (site.url) {
      meta.push({ property: "og:url", content: `${site.url}/shop` });
    }
    const links = site.url ? [{ rel: "canonical", href: `${site.url}/shop` }] : [];
    return { meta, links };
  },
  component: ShopPage,
});

function ShopPage() {
  return (
    <LanguageProvider>
      <DownloadProvider>
        <ShopContent />
      </DownloadProvider>
    </LanguageProvider>
  );
}

function ShopContent() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-alba-paper">
      <SceneNav page="shop" />
      <main>
        <header className="shell pt-[calc(76px+clamp(3rem,8vw,6rem))] pb-[clamp(2rem,4vw,3rem)]">
          <h1 className="display-xl type-poster text-alba-ink">{t("shop.title")}</h1>
        </header>
        <PhysicalCardsSection variant="shop" />
      </main>
      <Footer />
    </div>
  );
}
