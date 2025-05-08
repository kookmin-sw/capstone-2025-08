import MiniBox from '@/components/annotation/annotation-sidebar/roi-list/roi-mini-box';
import { UncertainROI } from '@/types/annotation-sidebar';

interface UncertainROIListProps {
  uncertainROIs: UncertainROI[];
}

export default function SidebarUncertainROI({
  uncertainROIs,
}: UncertainROIListProps) {
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
              <p className="text-xs text-[#CA0000]">{roi.UncertainRate}%</p>
            </div>

            <p className="text-muted-foreground text-xs">
              X: {roi.x} / Y: {roi.y} / W: {roi.width} / H: {roi.height}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
