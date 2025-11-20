"use client";

import React from "react";
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
  color: string;
};

const columns: Column[] = [
  { id: "idea", title: "Drafts", color: "border-gray-500/30" },
  { id: "editing", title: "In Progress", color: "border-yellow-500/30" },
  { id: "published", title: "Done", color: "border-green-500/30" },
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
          <div
            key={column.id}
            className={cn(
              "flex-shrink-0 w-[340px] bg-card rounded-xl border-2 flex flex-col",
              column.color
            )}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">
                  {column.title}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {columnItems.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {columnItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No items
                </div>
              ) : (
                columnItems.map((item) => (
                  <div key={item.id} className="bg-background rounded-lg p-2">
                    <ContentCard
                      item={item}
                      onTitleUpdate={onTitleUpdate}
                      onThumbnailUpdate={onThumbnailUpdate}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

