"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, Twitter, Layers, Save, Loader2 } from "lucide-react";
import { ContentItem, Platform } from "@/lib/content-data";
import { cn } from "@/lib/utils";

interface StyleLibraryProps {
  content: ContentItem[];
  selectedYouTubeIds: string[];
  selectedXIds: string[];
  onSelectionChange: (youtubeIds: string[], xIds: string[]) => void;
  onSave: () => Promise<void>;
}

export function StyleLibrary({
  content,
  selectedYouTubeIds,
  selectedXIds,
  onSelectionChange,
  onSave,
}: StyleLibraryProps) {
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialYouTubeIds, setInitialYouTubeIds] = useState<string[]>([]);
  const [initialXIds, setInitialXIds] = useState<string[]>([]);

  // Track initial state
  useEffect(() => {
    setInitialYouTubeIds(selectedYouTubeIds);
    setInitialXIds(selectedXIds);
  }, []);

  // Detect changes
  useEffect(() => {
    const ytChanged = JSON.stringify([...selectedYouTubeIds].sort()) !== JSON.stringify([...initialYouTubeIds].sort());
    const xChanged = JSON.stringify([...selectedXIds].sort()) !== JSON.stringify([...initialXIds].sort());
    setHasChanges(ytChanged || xChanged);
  }, [selectedYouTubeIds, selectedXIds, initialYouTubeIds, initialXIds]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      // Update initial state after successful save
      setInitialYouTubeIds(selectedYouTubeIds);
      setInitialXIds(selectedXIds);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving selection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Style Library</CardTitle>
            <CardDescription>
              Select content that represents your style. The AI will use these as reference examples.
              {totalSelected > 0 && (
                <span className="ml-2 text-primary font-semibold">
                  {totalSelected} selected
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Selection
              </>
            )}
          </Button>
        </div>
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

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No content found.</p>
            <p className="text-xs mt-1">
              Create some content first to build your style library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative rounded-lg border border-border transition-all cursor-pointer hover:border-primary/50 hover:shadow-lg overflow-hidden group",
                  isSelected(item.id, item.platform) && "border-primary shadow-lg ring-2 ring-primary/20"
                )}
                onClick={() => handleToggle(item.id, item.platform)}
              >
                {/* Thumbnail or Gradient Background */}
                {item.platform === "youtube" && item.thumbnailUrl ? (
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className={cn(
                        "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                        isSelected(item.id, item.platform)
                          ? "bg-primary border-primary"
                          : "bg-background/80 border-border backdrop-blur-sm"
                      )}>
                        {isSelected(item.id, item.platform) && (
                          <svg
                            className="w-4 h-4 text-primary-foreground"
                            fill="none"
                            strokeWidth="2"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Platform Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="bg-red-600 text-white border-0 text-xs"
                      >
                        <Youtube className="w-3 h-3 mr-1" />
                        YouTube
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
                    {/* Icon for X posts or no thumbnail */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.platform === "x" ? (
                        <Twitter className="w-12 h-12 text-blue-400/50" />
                      ) : (
                        <Youtube className="w-12 h-12 text-red-500/50" />
                      )}
                    </div>
                    
                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className={cn(
                        "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                        isSelected(item.id, item.platform)
                          ? "bg-primary border-primary"
                          : "bg-background/80 border-border backdrop-blur-sm"
                      )}>
                        {isSelected(item.id, item.platform) && (
                          <svg
                            className="w-4 h-4 text-primary-foreground"
                            fill="none"
                            strokeWidth="2"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Platform Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "border-0 text-xs",
                          item.platform === "x"
                            ? "bg-blue-500 text-white"
                            : "bg-red-600 text-white"
                        )}
                      >
                        {item.platform === "x" ? (
                          <>
                            <Twitter className="w-3 h-3 mr-1" />
                            X
                          </>
                        ) : (
                          <>
                            <Youtube className="w-3 h-3 mr-1" />
                            YouTube
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Content Info */}
                <div className="p-3 bg-card">
                  <p className="text-sm font-medium leading-tight line-clamp-2 mb-2">
                    {item.title}
                  </p>
                  {item.views && (
                    <span className="text-xs text-muted-foreground">
                      {item.views.toLocaleString()} views
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

