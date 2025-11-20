"use client";

import React from "react";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { TweetCard } from "@/components/dashboard/tweet-card";
import { Twitter } from "lucide-react";

interface TweetWallProps {
  items: ContentItem[];
  onTitleUpdate: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
  xAvatar?: string;
  xHandle?: string;
}

export function TweetWall({
  items,
  onTitleUpdate,
  onDelete,
  onStatusChange,
  xAvatar,
  xHandle,
}: TweetWallProps) {
  // Filter only X/Twitter items
  const tweets = items.filter(item => item.platform === "x");

  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-border/50 rounded-xl bg-card/30">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Twitter className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No tweets yet</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Press Space and add some tweet ideas to get started
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Twitter-style timeline */}
      <div className="border border-border rounded-xl overflow-hidden bg-[#000000]">
        {tweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            item={tweet}
            onTitleUpdate={onTitleUpdate}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            xAvatar={xAvatar}
            xHandle={xHandle}
          />
        ))}
      </div>
    </div>
  );
}

