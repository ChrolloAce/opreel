"use client";

import React, { useState } from "react";
import { MessageCircle, Repeat2, Heart, Share, MoreHorizontal, Trash2, CheckCircle2 } from "lucide-react";
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
  compact?: boolean; // For grid view
}

export function TweetCard({ item, onTitleUpdate, onDelete, onStatusChange, xAvatar, xHandle, compact = false }: TweetCardProps) {
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
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffHours < 1) return "now";
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
      return new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return null;
  };

  const relativeTime = getRelativeTime();
  const charCount = editedText.length;
  const maxChars = 280;
  const displayName = xHandle?.replace("@", "") || "Your Name";

  return (
    <div className={cn(
      "border-b border-[#2f3336] hover:bg-[#080808] transition-colors duration-200",
      compact && "border border-[#2f3336] rounded-xl bg-[#000000]"
    )}>
      {/* Main Post Container - Exact X Padding */}
      <div className={cn("px-4 py-3", compact && "px-3 py-2.5")}>
        <div className={cn("flex gap-3", compact && "gap-2")}>
          {/* (A) Profile Avatar - Smaller in compact mode */}
          <div className="flex-shrink-0">
            {xAvatar ? (
              <img
                src={xAvatar}
                alt={displayName}
                className={cn("rounded-full object-cover", compact ? "w-8 h-8" : "w-10 h-10")}
              />
            ) : (
              <div className={cn(
                "rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-semibold",
                compact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
              )}>
                {displayName[0]?.toUpperCase() || "X"}
              </div>
            )}
          </div>

          {/* Right Column - Header + Content */}
          <div className="flex-1 min-w-0">
            {/* (A) Header Section */}
            <div className={cn("flex items-start justify-between", compact ? "mb-0.5" : "mb-1")}>
              <div className="flex items-center gap-1 flex-wrap">
                <span className={cn(
                  "font-bold text-[#e7e9ea] hover:underline cursor-pointer",
                  compact ? "text-[13px] leading-4" : "text-[15px] leading-5"
                )}>
                  {displayName}
                </span>
                <span className={cn(
                  "text-[#71767b]",
                  compact ? "text-[13px] leading-4" : "text-[15px] leading-5"
                )}>
                  {xHandle || "@yourhandle"}
                </span>
                {relativeTime && (
                  <>
                    <span className="text-[#71767b] text-[13px]">·</span>
                    <span className={cn(
                      "text-[#71767b] hover:underline cursor-pointer",
                      compact ? "text-[13px] leading-4" : "text-[15px] leading-5"
                    )}>
                      {relativeTime}
                    </span>
                  </>
                )}
              </div>

              {/* More Options - Far Right */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-full hover:bg-[#1d9bf01a] hover:text-[#1d9bf0]",
                      compact ? "h-[28px] w-[28px] -mt-0.5 -mr-1" : "h-[34px] w-[34px] -mt-1 -mr-2"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className={cn(compact ? "w-[15px] h-[15px]" : "w-[18px] h-[18px]")} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#000000] border-[#2f3336] min-w-[300px]">
                  {onStatusChange && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(item.id, "idea")}
                        disabled={item.status === "idea"}
                        className="text-[#e7e9ea] py-3"
                      >
                        <CheckCircle2 className="w-[18px] h-[18px] mr-3 text-gray-500" />
                        Move to Drafts
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(item.id, "editing")}
                        disabled={item.status === "editing"}
                        className="text-[#e7e9ea] py-3"
                      >
                        <CheckCircle2 className="w-[18px] h-[18px] mr-3 text-yellow-500" />
                        Move to In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(item.id, "published")}
                        disabled={item.status === "published"}
                        className="text-[#e7e9ea] py-3"
                      >
                        <CheckCircle2 className="w-[18px] h-[18px] mr-3 text-green-500" />
                        Move to Done
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#2f3336]" />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete(item.id)}
                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10 py-3"
                  >
                    <Trash2 className="w-[18px] h-[18px] mr-3" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* (B) Main Content Section - Tweet Text */}
            {isEditing ? (
              <div className={cn("space-y-2", compact ? "mb-2" : "mb-3")} onClick={(e) => e.stopPropagation()}>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onBlur={handleTextBlur}
                  onKeyDown={handleTextKeyDown}
                  className={cn(
                    "bg-transparent border-[#2f3336] text-[#e7e9ea] resize-none focus-visible:ring-[#1d9bf0] p-0",
                    compact ? "min-h-[60px] text-[13px] leading-[18px]" : "min-h-[100px] text-[15px] leading-5"
                  )}
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
                  {!compact && <span className="text-[#71767b]">Cmd+Enter to save</span>}
                </div>
              </div>
            ) : (
              <div 
                className={cn(
                  "text-[#e7e9ea] whitespace-pre-wrap break-words cursor-text",
                  compact ? "text-[13px] leading-[18px] mb-2" : "text-[15px] leading-5 mb-3"
                )}
                onClick={handleTextClick}
              >
                {item.title}
              </div>
            )}

            {/* (D) Metadata Bar - Views count if published */}
            {item.status === "published" && item.views && !compact && (
              <div className="text-[13px] text-[#71767b] mb-3 leading-4">
                {item.views.toLocaleString()} Views
              </div>
            )}

            {/* (E) Action Bar - Engagement Icons */}
            <div className={cn(
              "flex items-center justify-between",
              compact ? "max-w-[300px] -ml-1.5" : "max-w-[425px] -ml-2"
            )}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "rounded-full hover:bg-[#1d9bf01a] hover:text-[#1d9bf0] text-[#71767b] group",
                  compact ? "h-[28px] px-1.5" : "h-[34px] px-2"
                )}
              >
                <MessageCircle className={cn(compact ? "w-[14px] h-[14px]" : "w-[18px] h-[18px]")} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "rounded-full hover:bg-[#00ba7c1a] hover:text-[#00ba7c] text-[#71767b] group",
                  compact ? "h-[28px] px-1.5" : "h-[34px] px-2"
                )}
              >
                <Repeat2 className={cn(compact ? "w-[14px] h-[14px]" : "w-[18px] h-[18px]")} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "rounded-full hover:bg-[#f918801a] hover:text-[#f91880] text-[#71767b] group",
                  compact ? "h-[28px] px-1.5" : "h-[34px] px-2"
                )}
              >
                <Heart className={cn(compact ? "w-[14px] h-[14px]" : "w-[18px] h-[18px]")} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "rounded-full hover:bg-[#1d9bf01a] hover:text-[#1d9bf0] text-[#71767b] group",
                  compact ? "h-[28px] px-1.5" : "h-[34px] px-2"
                )}
              >
                <Share className={cn(compact ? "w-[14px] h-[14px]" : "w-[18px] h-[18px]")} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

