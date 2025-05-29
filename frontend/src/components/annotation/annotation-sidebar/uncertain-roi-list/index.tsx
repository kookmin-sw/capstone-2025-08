'use client';

import MiniBox from '@/components/annotation/annotation-sidebar/roi-list/roi-mini-box';
import { RoiResponseDto } from '@/generated-api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface UncertainROIListProps {
  uncertainROIs: RoiResponseDto[];
  onToggleRedMask?: (roiId: number, showRed: boolean) => void;
}

export default function SidebarUncertainROI({
  uncertainROIs,
  onToggleRedMask,
}: UncertainROIListProps) {
  const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>(
    {},
  );

  const toggle = (roiId: number) => {
    if (roiId === undefined) return;

    const next = !visibilityMap[roiId];
    setVisibilityMap((prev) => ({ ...prev, [roiId]: next }));

    console.log('toggle RedMask:', roiId, next);
    onToggleRedMask?.(roiId, next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {uncertainROIs.map((roi, index) => (
        <div
          key={index}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white p-2.5 font-medium shadow"
        >
          <div className="text-muted-foreground text-sm">{index + 1}</div>

          <MiniBox roi={roi} />

          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm">ROI Index {index + 1}</p>
              <p className="text-xs text-[#CA0000]">30%</p>
            </div>

            <p className="text-muted-foreground text-xs">
              X: {roi.x} / Y: {roi.y} / W: {roi.width} / H: {roi.height}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => roi.id !== undefined && toggle(roi.id)}
            disabled={roi.id === undefined}
          >
            {roi.id !== undefined && visibilityMap[roi.id] ? (
              <Eye className="text-muted-foreground" />
            ) : (
              <EyeOff className="text-muted-foreground" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
