import {
  LandingHeader,
  LandingFooter,
  HeroSection,
  FeaturesSection,
  KitShowcaseSection,
  PricingSection,
  CTASection,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <KitShowcaseSection />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
