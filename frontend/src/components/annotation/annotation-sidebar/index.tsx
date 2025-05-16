import TabMenu from '@/components/common/tab-menu';
import { ROI } from '@/types/annotation';
import SidebarRoi from '@/components/annotation/annotation-sidebar/roi-list';
import SidebarUncertainROI from '@/components/annotation/annotation-sidebar/uncertain-roi-list';
import SidebarLabel from '@/components/annotation/annotation-sidebar/label-list';
import { dummyUncertainROIs } from '@/data/dummy';
import { LabelDto } from '@/generated-api';

interface AnnotationSidebarProps {
  rois: ROI[];
  onClickROI: (index: number) => void;
  onEditROI: (index: number) => void;
  onDeleteROI: (index: number) => void;
  labels: LabelDto[];
  onRenameLabel: (id: string, newName: string) => void;
  onDeleteLabel: (id: string) => void;
  onSelectLabelColor: (color: string) => void;
  onReorderLabels: (labels: LabelDto[]) => void;
}

export default function AnnotationSidebar({
  rois,
  onClickROI,
  onDeleteROI,
  onEditROI,
  labels,
  onRenameLabel,
  onDeleteLabel,
  onSelectLabelColor,
  onReorderLabels,
}: AnnotationSidebarProps) {
  const TopTabs = [
    {
      value: 'label',
      label: 'Label',
      content: (
        <SidebarLabel
          labels={labels}
          onRename={onRenameLabel}
          onDelete={onDeleteLabel}
          onSelect={onSelectLabelColor}
          onReorder={onReorderLabels}
        />
      ),
    },
    {
      value: 'rois',
      label: 'ROIs',
      content: (
        <SidebarRoi
          rois={rois}
          onClick={onClickROI}
          onDelete={onDeleteROI}
          onEdit={onEditROI}
        />
      ),
    },
    {
      value: 'uncertainRois',
      label: 'Uncertain ROIs',
      content: <SidebarUncertainROI uncertainROIs={dummyUncertainROIs} />,
    },
  ];

  return (
    <div className="border-border box-border flex h-full w-[30%] min-w-[300px] flex-col border-r-[1px] p-5">
      <TabMenu tabs={TopTabs} />
    </div>
  );
}
