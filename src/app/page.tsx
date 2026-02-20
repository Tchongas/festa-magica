import {
  LandingHeader,
  LandingFooter,
  HeroSection,
  FeaturesSection,
  KitShowcaseSection,
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
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
