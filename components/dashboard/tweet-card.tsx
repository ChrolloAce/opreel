"use client";

import React, { useState } from "react";
import { MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TweetCardProps {
  item: ContentItem;
  onTitleUpdate: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: ContentStatus) => void;
  xAvatar?: string;
  xHandle?: string;
}

export function TweetCard({ item, onTitleUpdate, onDelete, onStatusChange, xAvatar, xHandle }: TweetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.title);

  const handleTextClick = () => {
    setIsEditing(true);
    setEditedText(item.title);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (editedText.trim() && editedText !== item.title) {
      onTitleUpdate(item.id, editedText.trim());
    } else {
      setEditedText(item.title);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleTextBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedText(item.title);
    }
  };

  const getRelativeTime = () => {
    if (item.status === "published") {
      const now = new Date();
      const created = new Date(item.createdAt);
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "now";
      if (diffDays === 1) return "1d";
      if (diffDays < 7) return `${diffDays}d`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
      return `${Math.floor(diffDays / 365)}y`;
    }
    
    if (item.scheduledFor) {
      return `Scheduled ${new Date(item.scheduledFor).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    
    return null;
  };

  const relativeTime = getRelativeTime();
  const charCount = editedText.length;
  const maxChars = 280;

  return (
    <div className="border-b border-border hover:bg-[#080808] transition-colors cursor-pointer">
      <div className="flex gap-3 p-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {xAvatar ? (
            <img
              src={xAvatar}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              X
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-bold text-[#e7e9ea] hover:underline">
                {xHandle?.replace("@", "") || "Your Name"}
              </span>
              <span className="text-[#71767b]">{xHandle || "@yourhandle"}</span>
              {relativeTime && (
                <>
                  <span className="text-[#71767b]">·</span>
                  <span className="text-[#71767b]">{relativeTime}</span>
                </>
              )}
            </div>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-[#1d9bf01a] hover:text-[#1d9bf0] -mr-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#000000] border-[#2f3336]">
                {onStatusChange && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(item.id, "idea")}
                      disabled={item.status === "idea"}
                      className="text-[#e7e9ea]"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-gray-500" />
                      Move to Drafts
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(item.id, "editing")}
                      disabled={item.status === "editing"}
                      className="text-[#e7e9ea]"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-yellow-500" />
                      Move to In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(item.id, "published")}
                      disabled={item.status === "published"}
                      className="text-[#e7e9ea]"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      Move to Done
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2f3336]" />
                  </>
                )}
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

          {/* Tweet Text */}
          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                className="min-h-[80px] text-[15px] bg-transparent border-[#2f3336] text-[#e7e9ea] resize-none focus-visible:ring-[#1d9bf0]"
                autoFocus
                maxLength={maxChars}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={cn(
                  "text-[#71767b]",
                  charCount > maxChars && "text-red-500"
                )}>
                  {charCount}/{maxChars}
                </span>
                <span className="text-[#71767b]">Cmd+Enter to save, Esc to cancel</span>
              </div>
            </div>
          ) : (
            <div 
              className="text-[15px] text-[#e7e9ea] leading-5 whitespace-pre-wrap break-words"
              onClick={handleTextClick}
            >
              {item.title}
            </div>
          )}

          {/* Engagement Stats (if published) */}
          {item.status === "published" && item.views && (
            <div className="flex items-center gap-6 mt-3 text-[#71767b] text-[13px]">
              <div className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors">
                <span>{item.views.toLocaleString()} views</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

