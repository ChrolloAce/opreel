"use client";

import React from "react";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { ContentCard } from "@/components/dashboard/content-card";
import { TweetCard } from "@/components/dashboard/tweet-card";

interface BoardViewProps {
  items: ContentItem[];
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
  youtubeAvatar?: string;
  youtubeHandle?: string;
  xAvatar?: string;
  xHandle?: string;
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
  youtubeAvatar,
  youtubeHandle,
  xAvatar,
  xHandle,
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
            youtubeAvatar={youtubeAvatar}
            youtubeHandle={youtubeHandle}
            xAvatar={xAvatar}
            xHandle={xHandle}
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
  youtubeAvatar,
  youtubeHandle,
  xAvatar,
  xHandle,
}: {
  column: Column;
  items: ContentItem[];
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
  youtubeAvatar?: string;
  youtubeHandle?: string;
  xAvatar?: string;
  xHandle?: string;
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
              youtubeAvatar={youtubeAvatar}
              youtubeHandle={youtubeHandle}
              xAvatar={xAvatar}
              xHandle={xHandle}
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
  youtubeAvatar,
  youtubeHandle,
  xAvatar,
  xHandle,
}: {
  item: ContentItem;
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
  youtubeAvatar?: string;
  youtubeHandle?: string;
  xAvatar?: string;
  xHandle?: string;
}) {
  const { setNodeRef } = useDraggable({
    id: item.id,
    onStatusChange,
  });

  // Render different card based on platform
  if (item.platform === "x") {
    return (
      <div
        ref={setNodeRef}
        className="bg-[#000000] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-[#2f3336]"
      >
        <TweetCard
          item={item}
          onTitleUpdate={onTitleUpdate}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          xAvatar={xAvatar}
          xHandle={xHandle}
          compact={true}
        />
      </div>
    );
  }

  // Default: YouTube video card
  return (
    <div
      ref={setNodeRef}
      className="bg-background rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <ContentCard
        item={item}
        onTitleUpdate={onTitleUpdate}
        onThumbnailUpdate={onThumbnailUpdate}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        youtubeAvatar={youtubeAvatar}
        youtubeHandle={youtubeHandle}
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
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", id);
          }
          node.style.opacity = "0.5";
        };
        node.ondragend = () => {
          node.style.opacity = "1";
        };
        
        const column = node.closest('[data-droppable-id]') as HTMLElement | null;
        if (column) {
          column.ondragover = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = "move";
            }
          };
          column.ondrop = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) {
              const draggedId = e.dataTransfer.getData("text/plain");
              const droppedOnStatus = column.getAttribute('data-droppable-id') as ContentStatus;
              
              if (draggedId && droppedOnStatus) {
                onStatusChange(draggedId, droppedOnStatus);
              }
            }
          };
        }
      }
    },
  };
}

