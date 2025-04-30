import React from 'react';
import { AlignJustify, Pencil, Trash2 } from 'lucide-react';
import { ROI } from '@/types/annotation';
import MiniBox from '@/components/annotation/annotation-sidebar/roi-list/roi-mini-box';

interface RoiListProps {
  rois: ROI[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function SidebarRoi({ rois, onEdit, onDelete }: RoiListProps) {
  // const handleFocusROI = (roi: ROI) => {
  //   const viewer = viewerInstance.current;
  //   if (!viewer) return;
  //
  //   const center = new OpenSeadragon.Point(
  //     roi.x + roi.width / 2,
  //     roi.y + roi.height / 2,
  //   );
  //
  //   viewer.viewport.panTo(center);
  //   viewer.viewport.zoomTo(1.5); // 줌 레벨은 선택
  // };

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
      {rois.map((roi, index) => (
        <div
          key={index}
          // onClick={() => handleFocusROI(roi)}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white p-2.5 shadow"
        >
          <AlignJustify className="text-muted-foreground h-4 w-4" />

          <MiniBox roi={roi} />

          <div className="flex flex-1 justify-between">
            <div>
              <p className="text-sm font-medium">ROI Index {index + 1}</p>
              <p className="text-muted-foreground text-xs">
                X: {roi.x} / Y: {roi.y} / W: {roi.width} / H: {roi.height}
              </p>
            </div>

            <div className="flex gap-1">
              <button onClick={() => onEdit(index)}>
                <Pencil className="text-muted-foreground h-4 w-4 hover:text-blue-600" />
              </button>
              <button onClick={() => onDelete(index)}>
                <Trash2 className="text-muted-foreground h-4 w-4 hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
