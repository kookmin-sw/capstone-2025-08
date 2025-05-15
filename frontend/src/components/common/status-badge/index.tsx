'use client';

import { CircleCheck, Loader, CircleX, CirclePause } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'Completed' | 'Progress' | 'Failed' | 'Pending';

const statusStyles: Record<
  StatusType,
  { icon: React.ReactNode; text: string }
> = {
  Completed: {
    icon: <CircleCheck className="h-4 w-4 text-green-600" />,
    text: 'Completed',
  },
  Progress: {
    icon: <Loader className="h-4 w-4 text-sky-600" />,
    text: 'Progress',
  },
  Failed: {
    icon: <CircleX className="text-destructive h-4 w-4" />,
    text: 'Failed',
  },
  Pending: {
    icon: <CirclePause className="text-muted-foreground h-4 w-4" />,
    text: 'Pending',
  },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const fallback = {
    icon: <CirclePause className="text-muted-foreground h-4 w-4" />,
    text: 'Pending',
  };
  const { icon, text } = statusStyles[status] ?? fallback;

  return (
    <div
      className={cn(
        'text-muted-foreground inline-flex w-28 items-center justify-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-bold',
      )}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}
