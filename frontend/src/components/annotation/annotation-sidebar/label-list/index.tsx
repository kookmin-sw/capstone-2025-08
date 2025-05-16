import DraggableList from '@/components/common/draggable-list';
import LabelItem from '@/components/annotation/annotation-sidebar/label-list/label-item';
import { LabelDto } from '@/generated-api';

interface SidebarLabelProps {
  labels: LabelDto[];
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onSelect: (color: string) => void;
  onReorder: (reordered: LabelDto[]) => void;
}

export default function SidebarLabel({
  labels,
  onRename,
  onDelete,
  onSelect,
  onReorder,
}: SidebarLabelProps) {
  return (
    <DraggableList
      items={labels}
      getId={(l) => String(l.id ?? `temp-${l.name}`)}
      onReorder={(newLabels) => {
        const reordered = newLabels.map((label, i) => ({
          ...label,
          order: i,
        }));
        onReorder(reordered);
      }}
      renderItem={(label) => (
        <LabelItem
          key={label.name}
          label={label}
          onRename={onRename}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      )}
    />
  );
}
