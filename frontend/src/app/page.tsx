'use client';

import { Brain, PenTool, ChartLine, Earth, LucideIcon } from 'lucide-react';
import { useAutoRotateFeatures } from '@/hooks/use-auto-rotate-features';
import { useScrollState } from '@/hooks/use-scroll-state';
import { useMousePosition } from '@/hooks/use-mouse-position';
import LandingHeader from '@/components/landing/landing-header';
import LandingFooter from '@/components/landing/landing-footer';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import WorkflowSection from '@/components/landing/workflow-section';
import AboutSection from '@/components/landing/about-section';

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export default function Main() {
  const features: Feature[] = [
    {
      title: 'Two-Track Annotation',
      description:
        'Efficient human-in-the-loop annotation for cell and tissue segmentation. Achieve high-quality results with minimal manual effort through our two-track annotation workflow.',
      icon: PenTool,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Custom Model Builder',
      description:
        'Create your own AI models tailored to your research by defining custom labels and running training processes directly within the platform.',
      icon: Brain,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Public Space for Sharing',
      description:
        'Collaborate with peers by sharing your models, datasets, and research findings in a community-driven workspace designed for collective progress.',
      icon: Earth,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Insightful Analytics',
      description:
        'Access detailed performance metrics, label distributions, and annotation insights to validate your models and drive data-driven decisions.',
      icon: ChartLine,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const { activeFeature, setActiveFeature } = useAutoRotateFeatures(
    features.length,
  );
  const scrolled = useScrollState();
  const mousePosition = useMousePosition();

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <LandingHeader scrolled={scrolled} />
      <HeroSection
        features={features}
        activeFeature={activeFeature}
        mousePosition={mousePosition}
      />
      <FeaturesSection
        features={features}
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature} // 필요시
      />
      <WorkflowSection />
      <AboutSection />
      <LandingFooter />
    </div>
  );
}
