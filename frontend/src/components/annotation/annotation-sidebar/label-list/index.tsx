import { Label } from '@/types/annotation-sidebar';
import DraggableList from '@/components/common/draggable-list';
import LabelItem from '@/components/annotation/annotation-sidebar/label-list/label-item';

interface SidebarLabelProps {
  labels: Label[];
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onSelect: (color: string) => void;
  onReorder: (reordered: Label[]) => void;
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
      getId={(l) => l.id}
      onReorder={(newLabels) => {
        const reordered = newLabels.map((label, i) => ({
          ...label,
          order: i,
        }));
        onReorder(reordered);
      }}
      renderItem={(label) => (
        <LabelItem
          key={label.id}
          label={label}
          onRename={onRename}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      )}
    />
  );
}
