import React from 'react';

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode; // 여러가지 형식의 컨텐츠 (텍스트, JSX, 컴포넌트)
}

export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  height?: string; // 높이 커스터마이징
}
