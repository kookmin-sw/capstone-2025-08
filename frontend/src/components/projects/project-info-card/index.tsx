'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ReactNode } from 'react';

export default function ProjectInfoCard({
  icon,
  iconBgColor,
  iconColor,
  label,
  value,
  subText,
  progress,
  rightElement,
}: {
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  label: string;
  value: string | number;
  subText?: string;
  progress?: number;
  rightElement?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-6 shadow-sm">
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-row items-center gap-2">
          <div
            className={cn(
              'flex items-center justify-center rounded-full p-2',
              iconBgColor,
            )}
          >
            <div className={cn(iconColor)}>{icon}</div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm font-semibold">
              {label}
            </p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </div>
        {rightElement}
      </div>

      <>
        <Progress
          value={progress}
          className="bg-muted mt-4 h-2 w-full rounded-md"
        />
        {subText && (
          <p className="text-muted-foreground text-xs font-semibold">
            {subText}
          </p>
        )}
      </>
    </div>
  );
}
