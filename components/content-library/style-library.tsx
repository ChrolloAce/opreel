"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, Twitter, Layers } from "lucide-react";
import { ContentItem, Platform } from "@/lib/content-data";
import { cn } from "@/lib/utils";

interface StyleLibraryProps {
  content: ContentItem[];
  selectedYouTubeIds: string[];
  selectedXIds: string[];
  onSelectionChange: (youtubeIds: string[], xIds: string[]) => void;
}

export function StyleLibrary({
  content,
  selectedYouTubeIds,
  selectedXIds,
  onSelectionChange,
}: StyleLibraryProps) {
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");

  const youtubeContent = content.filter((item) => item.platform === "youtube");
  const xContent = content.filter((item) => item.platform === "x");

  const filteredContent =
    platformFilter === "all"
      ? content
      : content.filter((item) => item.platform === platformFilter);

  const handleToggle = (id: string, platform: Platform) => {
    if (platform === "youtube") {
      const newSelection = selectedYouTubeIds.includes(id)
        ? selectedYouTubeIds.filter((itemId) => itemId !== id)
        : [...selectedYouTubeIds, id];
      onSelectionChange(newSelection, selectedXIds);
    } else {
      const newSelection = selectedXIds.includes(id)
        ? selectedXIds.filter((itemId) => itemId !== id)
        : [...selectedXIds, id];
      onSelectionChange(selectedYouTubeIds, newSelection);
    }
  };

  const isSelected = (id: string, platform: Platform) => {
    return platform === "youtube"
      ? selectedYouTubeIds.includes(id)
      : selectedXIds.includes(id);
  };

  const totalSelected = selectedYouTubeIds.length + selectedXIds.length;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Style Library</CardTitle>
        <CardDescription>
          Select content that represents your style. The AI will use these as reference examples.
          {totalSelected > 0 && (
            <span className="ml-2 text-primary font-semibold">
              {totalSelected} selected
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Filter */}
        <Tabs value={platformFilter} onValueChange={(v) => setPlatformFilter(v as Platform | "all")}>
          <TabsList className="w-full bg-muted">
            <TabsTrigger value="all" className="flex-1 gap-2">
              <Layers className="w-4 h-4" />
              All ({content.length})
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex-1 gap-2">
              <Youtube className="w-4 h-4" />
              YouTube ({youtubeContent.length})
            </TabsTrigger>
            <TabsTrigger value="x" className="flex-1 gap-2">
              <Twitter className="w-4 h-4" />
              X ({xContent.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content List */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No content found.</p>
            <p className="text-xs mt-1">
              Create some content first to build your style library.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-border transition-colors cursor-pointer hover:bg-accent",
                  isSelected(item.id, item.platform) && "bg-accent border-primary"
                )}
                onClick={() => handleToggle(item.id, item.platform)}
              >
                <Checkbox
                  checked={isSelected(item.id, item.platform)}
                  onCheckedChange={() => handleToggle(item.id, item.platform)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        item.platform === "youtube"
                          ? "border-red-500/50 text-red-500"
                          : "border-blue-400/50 text-blue-400"
                      )}
                    >
                      {item.platform === "youtube" ? (
                        <>
                          <Youtube className="w-3 h-3 mr-1" />
                          YouTube
                        </>
                      ) : (
                        <>
                          <Twitter className="w-3 h-3 mr-1" />
                          X
                        </>
                      )}
                    </Badge>
                    {item.views && (
                      <span className="text-xs text-muted-foreground">
                        {item.views.toLocaleString()} views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

