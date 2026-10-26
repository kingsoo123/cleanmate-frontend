import { AudienceSections } from "@/components/landing/audience-sections";
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TickerStrip } from "@/components/landing/ticker-strip";
import { VisualStrip } from "@/components/landing/visual-strip";

export default function Home() {
  return (
    <div className="min-h-full bg-background px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_8px_40px_-12px_rgba(99,91,255,0.25)] sm:min-h-[calc(100vh-2.5rem)]">
        <SiteHeader />
        <main className="flex-1">
          <HeroSection />
          <TickerStrip />
          <HowItWorks />
          <VisualStrip />
          <AudienceSections />
          <FeaturesGrid />
          <CtaSection />
          <PwaInstallPrompt />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
