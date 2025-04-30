import TabMenu from '@/components/common/tab-menu';
import { ROI } from '@/types/annotation';
import SidebarRoi from '@/components/annotation/annotation-sidebar/roi-list';

interface AnnotationSidebarProps {
  rois: ROI[];
  onEditROI: (index: number) => void;
  onDeleteROI: (index: number) => void;
}

export default function AnnotationSidebar({
  rois,
  onEditROI,
  onDeleteROI,
}: AnnotationSidebarProps) {
  const TopTabs = [
    {
      value: 'label',
      label: 'Label',
      content: 'gkdl',
    },
    {
      value: 'rois',
      label: 'ROIs',
      content: (
        <SidebarRoi rois={rois} onEdit={onEditROI} onDelete={onDeleteROI} />
      ),
    },
    {
      value: 'uncertainRois',
      label: 'Uncertain ROIs',
      content: '아직 준비 중입니다.',
    },
  ];

  const BottomTabs = [
    {
      value: 'image',
      label: 'Image',
      content: '하이',
    },
    {
      value: 'scan',
      label: 'Scan',
      content: 'zz',
    },
    {
      value: 'acquisition',
      label: 'Acquisition',
      content: '아직 준비 중입니다.',
    },
  ];

  return (
    <div className="border-border flex h-full w-[30%] min-w-[300px] flex-col justify-between border-r-[1px] p-5">
      <TabMenu tabs={TopTabs} />
      <TabMenu tabs={BottomTabs} height="30%" />
    </div>
  );
}
