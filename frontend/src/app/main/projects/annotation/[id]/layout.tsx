import React from 'react';
import AnnotationHeader from '@/components/annotation/annotation-header';

export default function AnnotationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden overscroll-none">
      <div className="absolute top-0 z-10">
        <AnnotationHeader />
      </div>
      <div className="mt-16 h-full">{children}</div>
    </div>
  );
}
