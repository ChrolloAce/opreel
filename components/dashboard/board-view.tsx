"use client";

import React from "react";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { ContentCard } from "@/components/dashboard/content-card";

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
  const getItemsByStatus = (status: ContentStatus) => {
    return items.filter((item) => item.status === status);
  };

  return (
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
  const { setNodeRef } = useDraggable({
    id: item.id,
    onStatusChange,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-background rounded-lg p-2 cursor-grab active:cursor-grabbing"
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

// Simple useDraggable hook using native HTML5 drag and drop
function useDraggable({ 
  id, 
  onStatusChange 
}: { 
  id: string;
  onStatusChange: (id: string, status: ContentStatus) => void;
}) {
  return {
    setNodeRef: (node: HTMLElement | null) => {
      if (node) {
        node.draggable = true;
        node.ondragstart = (e) => {
          e.dataTransfer!.effectAllowed = "move";
          e.dataTransfer!.setData("text/plain", id);
          node.style.opacity = "0.5";
        };
        node.ondragend = () => {
          node.style.opacity = "1";
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
  };
}

