"use client";

import React, { useState, useRef } from "react";
import { MoreVertical, Upload, Trash2 } from "lucide-react";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  item: ContentItem;
  onTitleUpdate: (id: string, newTitle: string) => void;
  onThumbnailUpdate: (id: string, file: File) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<ContentStatus, string> = {
  idea: "bg-gray-600 text-white",
  script: "bg-blue-600 text-white",
  filming: "bg-orange-600 text-white",
  editing: "bg-yellow-600 text-white",
  scheduled: "bg-purple-600 text-white",
  published: "bg-green-600 text-white",
};

export function ContentCard({ item, onTitleUpdate, onThumbnailUpdate, onDelete }: ContentCardProps) {
  const statusColorClass = statusColors[item.status];
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setEditedTitle(item.title);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() && editedTitle !== item.title) {
      onTitleUpdate(item.id, editedTitle.trim());
    } else {
      setEditedTitle(item.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setEditedTitle(item.title);
    }
  };

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onThumbnailUpdate(item.id, file);
    }
  };

  const getRelativeTime = () => {
    if (item.status === "published") {
      const now = new Date();
      const created = new Date(item.createdAt);
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    }
    
    if (item.scheduledFor) {
      return `Scheduled ${new Date(item.scheduledFor).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    
    return null; // Don't show "Draft"
  };

  const relativeTime = getRelativeTime();

  return (
    <div className="flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Thumbnail Area - Exact YouTube Style */}
      <div 
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#282828] mb-3 group cursor-pointer"
        onClick={handleThumbnailClick}
      >
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#282828]">
            <div className="text-[#aaaaaa] text-sm font-medium">No thumbnail</div>
          </div>
        )}
        
        {/* Upload overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-white" />
            <span className="text-white text-sm font-medium">Upload thumbnail</span>
          </div>
        </div>

        {/* Duration overlay - Bottom Right (YouTube style) */}
        {item.views !== undefined && (
          <div className="absolute bottom-1 right-1 bg-black/90 text-white text-xs font-semibold px-1 py-0.5 rounded pointer-events-none">
            19:00
          </div>
        )}
      </div>

      {/* Content Info - Exact YouTube Style (No Icons) */}
      <div className="flex gap-0">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="font-medium text-sm h-auto py-0 px-0 border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-[#f1f1f1] mb-1"
              autoFocus
            />
          ) : (
            <h3 
              className="font-medium text-sm leading-tight line-clamp-2 text-[#f1f1f1] mb-1 cursor-text hover:text-[#3ea6ff] transition-colors"
              onClick={handleTitleClick}
            >
              {item.title}
            </h3>
          )}
          
          <div className="flex flex-col text-xs text-[#aaaaaa]">
            <span>YouTube Channel</span>
            {(item.views !== undefined || relativeTime) && (
              <div className="flex items-center">
                {item.views !== undefined && (
                  <>
                    <span>{item.views.toLocaleString()} views</span>
                    {relativeTime && <span className="mx-1">•</span>}
                  </>
                )}
                {relativeTime && <span>{relativeTime}</span>}
              </div>
            )}
          </div>
        </div>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-[#3f3f3f] mt-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => onDelete(item.id)}
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
