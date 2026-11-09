import { createFileRoute } from "@tanstack/react-router";
import { CompetitionSection } from "@/components/site/CompetitionSection";
import { DownloadProvider } from "@/components/site/DownloadModal";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { HowToPlaySection } from "@/components/site/HowToPlaySection";
import { SceneNav } from "@/components/nav/SceneNav";
import { PhysicalCardsSection } from "@/components/site/PhysicalCardsSection";
import { TableToScreen } from "@/components/site/TableToScreen";
import { LanguageProvider } from "@/lib/i18n";
import { site } from "@/content/site";

const title = "Albastini — Two ways to play. One Albastini.";
const description =
  "Albastini is a Tanzanian card game you can play two ways: with the physical cards around a table, or on the Albastini app.";

export const Route = createFileRoute("/")({
  // One clock for SSR + hydration. Tournament/winner content is static and
  // version-controlled (src/content/), so nothing is fetched or polled.
  loader: () => ({ renderedAt: Date.now() }),
  head: () => {
    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: site.locale },
      { property: "og:locale:alternate", content: site.alternateLocale },
      // Large card only when approved artwork exists; never an invented image.
      { name: "twitter:card", content: site.ogImage ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    const links: Record<string, string>[] = [];
    const scripts: { type: string; children: string }[] = [];
    if (site.url) {
      meta.push({ property: "og:url", content: `${site.url}/` });
      links.push({ rel: "canonical", href: `${site.url}/` });
      // Only factually supported structured data: who/what, no ratings,
      // prices, availability or events.
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${site.url}/#org`,
              name: site.name,
              url: `${site.url}/`,
            },
            {
              "@type": "WebSite",
              "@id": `${site.url}/#website`,
              name: site.name,
              url: `${site.url}/`,
              inLanguage: ["en", "sw"],
              publisher: { "@id": `${site.url}/#org` },
            },
          ],
        }),
      });
    }
    if (site.ogImage && site.url) {
      meta.push(
        { property: "og:image", content: `${site.url}${site.ogImage.path}` },
        { property: "og:image:width", content: String(site.ogImage.width) },
        { property: "og:image:height", content: String(site.ogImage.height) },
        { property: "og:image:alt", content: site.ogImage.alt },
        { name: "twitter:image", content: `${site.url}${site.ogImage.path}` },
      );
    }
    return { meta, links, scripts };
  },
  component: Index,
});

function Index() {
  const { renderedAt } = Route.useLoaderData();
  return (
    <LanguageProvider>
      <DownloadProvider>
        <div className="min-h-screen bg-alba-ink">
          <SceneNav />
          {/* CEO-approved journey: Hero / Two Ways → How to Play → Competition → Physical Cards → Final CTA */}
          <main>
            <Hero />
            <TableToScreen />
            <HowToPlaySection />
            <CompetitionSection renderedAt={renderedAt} />
            <PhysicalCardsSection />
            <FinalCTA />
          </main>
          <Footer />
        </div>
      </DownloadProvider>
    </LanguageProvider>
  );
}
