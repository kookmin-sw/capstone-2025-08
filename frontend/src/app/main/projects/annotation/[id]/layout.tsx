import AnnotationHeader from '@/components/annotation/annotation-header';

export default function AnnotationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col gap-16 overflow-hidden overscroll-none">
      <div className="sticky top-0 z-10">
        <AnnotationHeader />
      </div>
      <div>{children}</div>
    </div>
  );
}
