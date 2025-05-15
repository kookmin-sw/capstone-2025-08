import {
  BarChart,
  BookOpen,
  Brain,
  ChartLine,
  Database,
  Earth,
  PenLine,
  PenTool,
  Shield,
  Users,
} from 'lucide-react';
import { Feature, WorkflowStep, AboutHighlight } from '@/types/landing';

export const features: Feature[] = [
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

export const workflowSteps: WorkflowStep[] = [
  {
    step: '1',
    title: 'Image Upload & Management',
    description:
      'Start your workflow by uploading and organizing whole slide images into structured projects.',
    icon: Database,
  },
  {
    step: '2',
    title: 'AI-Powered Annotation & Training',
    description:
      'Leverage AI-assisted tools to annotate slides and train custom models with minimal effort.',
    icon: PenLine,
  },
  {
    step: '3',
    title: 'Analytics & Collaboration',
    description:
      'Unlock insights with advanced analytics and share your results to accelerate research.',
    icon: BarChart,
  },
];

export const aboutHighlights: AboutHighlight[] = [
  {
    title: 'Security',
    description:
      'Protect your research and patient data with enterprise-level security, built for medical environments.',
    icon: Shield,
  },
  {
    title: 'Documentation',
    description:
      'Access step-by-step documentation and practical resources designed for real-world pathology workflows.',
    icon: BookOpen,
  },
  {
    title: 'Support',
    description:
      'Our dedicated team supports you every step of the way—from onboarding to advanced implementation.',
    icon: Users,
  },
];
