import { LandingNav } from '@/components/landing-nav';
import { LandingHero } from '@/components/landing-hero';
import { FeaturesSection } from '@/components/features-section';

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <LandingNav />
      <LandingHero />
      <FeaturesSection />
    </main>
  );
}
