"use client";

import React, { useState } from "react";
import { Plus, Youtube, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentItem, Platform } from "@/lib/content-data";

interface QuickAddPanelProps {
  onAddItems: (items: ContentItem[]) => void;
}

export function QuickAddPanel({ onAddItems }: QuickAddPanelProps) {
  const [bulkText, setBulkText] = useState("");
  const [platform, setPlatform] = useState<Platform>("youtube");

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;

    // Split by line breaks and filter out empty lines
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    // Create content items from titles
    const newItems: ContentItem[] = lines.map((title) => ({
      id: Math.random().toString(36).substr(2, 9),
      platform: platform,
      title: title,
      status: "idea",
      createdAt: new Date().toISOString(),
    }));

    onAddItems(newItems);
    setBulkText("");
  };

  const itemCount = bulkText.split('\n').filter(line => line.trim().length > 0).length;
  const itemLabel = platform === "youtube" ? "Videos" : "Tweets";

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Add Content
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Choose platform and paste your content (one per line)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Selector */}
        <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
          <TabsList className="w-full bg-muted">
            <TabsTrigger value="youtube" className="flex-1 gap-2">
              <Youtube className="w-4 h-4" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="x" className="flex-1 gap-2">
              <Twitter className="w-4 h-4" />
              X / Twitter
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Textarea
          placeholder={platform === "youtube" 
            ? "Paste your video titles here...\n\nI Built This App in 14 Days… Now It Makes $30K/Month\n\nThe Tech Stack I Used To Build 10 AI Apps"
            : "Paste your tweet ideas here...\n\nJust shipped a new feature 🚀\n\nHere's what I learned building in public..."
          }
          className="min-h-[300px] font-sans text-sm bg-background/50 border-border/50 resize-none"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"} ready
          </span>
          <span>Each line = 1 {platform === "youtube" ? "video" : "tweet"}</span>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={handleBulkAdd}
          disabled={!bulkText.trim()}
        >
          <Plus className="w-4 h-4" />
          Add {itemCount || 0} {itemLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
