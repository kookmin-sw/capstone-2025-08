import React from 'react';
import { ROI } from '@/types/project-schema';

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode; // 여러가지 형식의 컨텐츠 (텍스트, JSX, 컴포넌트)
}

// export interface SidebarROI extends ROI {
//   id: string;
//   name: string;
//   order: number;
//   createdAt?: number;
// }

export interface UncertainROI extends ROI {
  UncertainRate: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  // order: number;
  // createdAt?: number;
}
