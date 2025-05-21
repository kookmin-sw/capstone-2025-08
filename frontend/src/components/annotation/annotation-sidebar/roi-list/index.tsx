import { Pencil, Trash2 } from 'lucide-react';
import MiniBox from '@/components/annotation/annotation-sidebar/roi-list/roi-mini-box';
import { RoiResponseDto } from '@/generated-api';

interface RoiListProps {
  rois: RoiResponseDto[];
  onClick: (index: number) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
}

export default function SidebarRoi({
  rois,
  onClick,
  onDelete,
  onEdit,
}: RoiListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {rois.map((roi, index) => (
        <div
          key={index}
          onClick={() => onClick(index)}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white p-2.5 font-medium shadow"
        >
          <div className="text-muted-foreground text-sm">{index + 1}</div>

          <MiniBox roi={roi} />

          <div className="flex flex-1 justify-between">
            <div>
              <p className="text-sm">ROI Index {index + 1}</p>
              <p className="text-muted-foreground text-xs">
                X: {roi.x} / Y: {roi.y} / W: {roi.width} / H: {roi.height}
              </p>
            </div>

            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(index);
                }}
              >
                <Pencil className="text-muted-foreground h-4 w-4 cursor-pointer hover:text-blue-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
              >
                <Trash2 className="text-muted-foreground h-4 w-4 cursor-pointer hover:text-[#CA0000]" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
