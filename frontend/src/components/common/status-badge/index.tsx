'use client';

import { CircleCheck, Loader, CircleX, CirclePause } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'completed' | 'progress' | 'failed' | 'pending';

const statusStyles: Record<
  StatusType,
  { icon: React.ReactNode; text: string }
> = {
  completed: {
    icon: <CircleCheck className="h-4 w-4 text-green-600" />,
    text: 'Completed',
  },
  progress: {
    icon: <Loader className="h-4 w-4 text-sky-600" />,
    text: 'Progress',
  },
  failed: {
    icon: <CircleX className="text-destructive h-4 w-4" />,
    text: 'Failed',
  },
  pending: {
    icon: <CirclePause className="text-muted-foreground h-4 w-4" />,
    text: 'Pending',
  },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const { icon, text } = statusStyles[status];

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
