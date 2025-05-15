'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-row items-center gap-3 rounded-lg border bg-white py-4 pl-3 pr-1 shadow-sm">
      <div className="grid shrink-0 grid-cols-2 gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="size-11 rounded" />
        ))}
      </div>

      <div className="-mt-1 flex w-full flex-col gap-2">
        <div className="flex items-center justify-start gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="w-38 h-5 rounded" />
        <Skeleton className="w-38 h-3 rounded" />
        <Skeleton className="w-38 h-3 rounded" />
      </div>
    </div>
  );
}
