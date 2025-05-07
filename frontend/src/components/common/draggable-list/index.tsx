import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers';
import React from 'react';

interface DraggableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

export default function DraggableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
}: DraggableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => getId(i) === active.id);
    const newIndex = items.findIndex((i) => getId(i) === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    onReorder(newItems);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2.5">{items.map(renderItem)}</div>
      </SortableContext>
    </DndContext>
  );
}
