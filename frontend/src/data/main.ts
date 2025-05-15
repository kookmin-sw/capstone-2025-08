import {
  BarChart,
  Brain,
  Layers,
  Microscope,
  PenLine,
  PlusCircle,
  Share2,
  Zap,
} from 'lucide-react';

// 메인 페이지 feature section data
export const featureSectionData = [
  {
    title: 'Precise Cell Segmentation',
    description:
      'Automatically identify and annotate cell and tissue regions from Whole Slide Images (WSIs) using dual-branch AI pipelines tailored for medical pathology.',
    icon: Microscope,
  },
  {
    title: 'AI-Assisted Diagnosis',
    description:
      'Accelerate diagnosis with AI while maintaining clinical oversight using our human-in-the-loop annotation process.',
    icon: Brain,
  },
  {
    title: 'Rapid Processing',
    description:
      'Segment and analyze gigapixel-scale slides in seconds using our optimized inference system and expandable ROI mechanism.',
    icon: Zap,
  },
  {
    title: 'Multi-Layer Analysis',
    description:
      'Explore pathology data at both cellular and tissue levels simultaneously for comprehensive insight and enhanced precision.',
    icon: Layers,
  },
];

//
export const quickActionData = [
  {
    title: 'New Project',
    description: 'Start a new analysis project with our AI-powered tools',
    icon: PlusCircle,
    href: 'main/projects',
  },
  {
    title: 'Annotation',
    description: 'Powerful tools for precise annotation of pathology images',
    icon: PenLine,
    href: 'main/projects',
  },
  {
    title: 'Public Space',
    description: 'Explore and share models with the pathology community',
    icon: Share2,
    href: 'main/public-space/community',
  },
  {
    title: 'Analysis',
    description: 'Run advanced AI analysis on your pathology data',
    icon: BarChart,
    href: 'main/projects',
  },
];
