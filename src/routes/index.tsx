import { createFileRoute } from "@tanstack/react-router";
import { CompetitionSection } from "@/components/site/CompetitionSection";
import { DownloadProvider } from "@/components/site/DownloadModal";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { HowToPlaySection } from "@/components/site/HowToPlaySection";
import { Navbar } from "@/components/site/Navbar";
import { PhysicalCardsSection } from "@/components/site/PhysicalCardsSection";
import { TwoWaysSection } from "@/components/site/TwoWaysSection";
import { LanguageProvider } from "@/lib/i18n";

const title = "Albastini — Two ways to play. One Albastini.";
const description =
  "Albastini is a Tanzanian card game you can play two ways: with the physical cards around a table, or on the Albastini app.";

export const Route = createFileRoute("/")({
  // One clock for SSR + hydration. Tournament/winner content is static and
  // version-controlled (src/content/), so nothing is fetched or polled.
  loader: () => ({ renderedAt: Date.now() }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { renderedAt } = Route.useLoaderData();
  return (
    <LanguageProvider>
      <DownloadProvider>
        <div className="min-h-screen bg-alba-ink">
          <Navbar />
          {/* CEO-approved journey: Hero / Two Ways → How to Play → Competition → Physical Cards → Final CTA */}
          <main>
            <Hero />
            <TwoWaysSection />
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
