'use client';

import { useAutoRotateFeatures } from '@/hooks/use-auto-rotate-features';
import { useScrollState } from '@/hooks/use-scroll-state';
import LandingHeader from '@/components/landing/landing-header';
import LandingFooter from '@/components/landing/landing-footer';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import WorkflowSection from '@/components/landing/workflow-section';
import AboutSection from '@/components/landing/about-section';
import { features, workflowSteps, aboutHighlights } from '@/data/landing-data';

export default function Main() {
  const { activeFeature, setActiveFeature } = useAutoRotateFeatures(
    features.length,
  );
  const scrolled = useScrollState();

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <LandingHeader scrolled={scrolled} />
      <HeroSection features={features} activeFeature={activeFeature} />
      <FeaturesSection
        features={features}
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature} // 필요시
      />
      <WorkflowSection workflowSteps={workflowSteps} />
      <AboutSection aboutHighlights={aboutHighlights} />
      <LandingFooter />
    </div>
  );
}
