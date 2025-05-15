import { LucideIcon } from 'lucide-react';

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AboutHighlight {
  title: string;
  description: string;
  icon: LucideIcon;
}
