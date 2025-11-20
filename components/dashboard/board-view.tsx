"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { ContentCard } from "@/components/dashboard/content-card";
import { cn } from "@/lib/utils";

interface BoardViewProps {
  items: ContentItem[];
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}

type Column = {
  id: ContentStatus;
  title: string;
};

const columns: Column[] = [
  { id: "idea", title: "Drafts" },
  { id: "editing", title: "In Progress" },
  { id: "published", title: "Done" },
];

export function BoardView({
  items,
  onTitleUpdate,
  onThumbnailUpdate,
  onDelete,
  onStatusChange,
}: BoardViewProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getItemsByStatus = (status: ContentStatus) => {
    return items.filter((item) => item.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const itemId = active.id as string;
    const newStatus = over.id as ContentStatus;

    // Check if dropped on a column
    if (columns.some((col) => col.id === newStatus)) {
      const item = items.find((i) => i.id === itemId);
      if (item && item.status !== newStatus) {
        onStatusChange(itemId, newStatus);
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 h-[calc(100vh-180px)] overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnItems = getItemsByStatus(column.id);
          return (
            <DroppableColumn
              key={column.id}
              column={column}
              items={columnItems}
              onTitleUpdate={onTitleUpdate}
              onThumbnailUpdate={onThumbnailUpdate}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="bg-background rounded-lg p-2 opacity-90 shadow-xl rotate-3">
            <ContentCard
              item={activeItem}
              onTitleUpdate={onTitleUpdate}
              onThumbnailUpdate={onThumbnailUpdate}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableColumn({
  column,
  items,
  onTitleUpdate,
  onThumbnailUpdate,
  onDelete,
  onStatusChange,
}: {
  column: Column;
  items: ContentItem[];
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}) {
  return (
    <div
      id={column.id}
      className="flex-shrink-0 w-[340px] bg-card rounded-xl border border-border flex flex-col"
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">
            {column.title}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {items.length}
          </span>
        </div>
      </div>

      {/* Column Content - Droppable */}
      <div
        data-droppable-id={column.id}
        className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]"
      >
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Drop items here
          </div>
        ) : (
          items.map((item) => (
            <DraggableCard
              key={item.id}
              item={item}
              onTitleUpdate={onTitleUpdate}
              onThumbnailUpdate={onThumbnailUpdate}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  item,
  onTitleUpdate,
  onThumbnailUpdate,
  onDelete,
  onStatusChange,
}: {
  item: ContentItem;
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-background rounded-lg p-2 cursor-grab active:cursor-grabbing transition-opacity",
        isDragging && "opacity-50"
      )}
    >
      <ContentCard
        item={item}
        onTitleUpdate={onTitleUpdate}
        onThumbnailUpdate={onThumbnailUpdate}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}

// Simple useDraggable hook
function useDraggable({ id }: { id: string }) {
  const [isDragging, setIsDragging] = React.useState(false);

  return {
    attributes: {
      role: "button",
      "aria-pressed": isDragging,
      "data-draggable-id": id,
    },
    listeners: {
      onPointerDown: () => setIsDragging(true),
      onPointerUp: () => setIsDragging(false),
    },
    setNodeRef: (node: HTMLElement | null) => {
      if (node) {
        node.draggable = true;
        node.ondragstart = (e) => {
          e.dataTransfer!.effectAllowed = "move";
          e.dataTransfer!.setData("text/plain", id);
        };
        
        const column = node.closest('[data-droppable-id]');
        if (column) {
          column.ondragover = (e) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = "move";
          };
          column.ondrop = (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer!.getData("text/plain");
            const droppedOnStatus = column.getAttribute('data-droppable-id') as ContentStatus;
            
            if (draggedId && droppedOnStatus) {
              onStatusChange(draggedId, droppedOnStatus);
            }
          };
        }
      }
    },
    transform: null,
    isDragging,
  };
}

