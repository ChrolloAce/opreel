"use client";

import React from "react";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { ContentCard } from "@/components/dashboard/content-card";
import { LayoutGrid } from "lucide-react";

interface ContentGridProps {
  items: ContentItem[];
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
  onOpenScript?: (id: string) => void;
  youtubeAvatar?: string;
  youtubeHandle?: string;
}

export function ContentGrid({ items, onTitleUpdate, onThumbnailUpdate, onDelete, onStatusChange, onOpenScript, youtubeAvatar, youtubeHandle }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <LayoutGrid className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No content found</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Try adjusting your filters or add new content using the spacebar.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
        {items.map((item) => (
          <ContentCard 
            key={item.id} 
            item={item}
            onTitleUpdate={onTitleUpdate}
            onThumbnailUpdate={onThumbnailUpdate}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onOpenScript={onOpenScript}
            youtubeAvatar={youtubeAvatar}
            youtubeHandle={youtubeHandle}
          />
        ))}
      </div>
    </div>
  );
}

