'use client';

import dynamic from 'next/dynamic';

const AnnotationTestViewer = dynamic(
  () => import('@/components/annotation/annotation-test-viewer'),
  { ssr: false },
);

export default function TestPage() {
  return (
    <div className="flex h-screen flex-col items-center overflow-hidden p-10">
      <h1 className="text-lg font-semibold">정욱오빠 화이팅 🦾</h1>
      <AnnotationTestViewer />
    </div>
  );
}
