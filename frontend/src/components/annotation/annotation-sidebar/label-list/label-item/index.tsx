import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlignJustify, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/types/annotation-sidebar';

interface LabelItemProps {
  label: Label;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onSelect: (color: string) => void;
}

export default function LabelItem({
  label,
  onRename,
  onDelete,
  onSelect,
}: LabelItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label.name);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: label.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white p-2.5 font-medium shadow"
      onClick={() => onSelect(label.color)}
    >
      <AlignJustify
        {...attributes}
        {...listeners}
        className="text-muted-foreground h-4 w-4 hover:cursor-grab active:cursor-grabbing"
      />

      <div className="flex h-10 w-10 items-center justify-center">
        <div
          className="h-[25px] w-[25px] rounded-full"
          style={{ backgroundColor: label.color }}
        />
      </div>

      <div className="flex flex-1 justify-between">
        {editing ? (
          <input
            className="text-sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              onRename(label.id, editValue);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onRename(label.id, editValue);
                setEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <div>
            <p className="text-sm">{label.name}</p>
            <p className="text-muted-foreground text-xs">
              Hex Color: {label.color}
            </p>
          </div>
        )}

        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            <Pencil className="text-muted-foreground h-4 w-4 cursor-pointer hover:text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(label.id);
            }}
          >
            <Trash2 className="text-muted-foreground h-4 w-4 cursor-pointer hover:text-[#CA0000]" />
          </button>
        </div>
      </div>
    </div>
  );
}
