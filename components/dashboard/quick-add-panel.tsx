"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ContentItem } from "@/lib/content-data";

interface QuickAddPanelProps {
  onAddItems: (items: ContentItem[]) => void;
}

export function QuickAddPanel({ onAddItems }: QuickAddPanelProps) {
  const [bulkText, setBulkText] = useState("");

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
      platform: "youtube",
      title: title,
      status: "idea",
      createdAt: new Date().toISOString(),
    }));

    onAddItems(newItems);
    setBulkText("");
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Add Video Titles
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Paste your video titles below (one per line)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your video titles here...&#10;&#10;I Built This App in 14 Days… Now It Makes $30K/Month (NO CODE)&#10;&#10;The Tech Stack I Used To Build 10 AI Apps&#10;&#10;The Gold Rush Is Here: Build an AI App in 48 Hours"
          className="min-h-[300px] font-sans text-sm bg-background/50 border-border/50 resize-none"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {bulkText.split('\n').filter(line => line.trim().length > 0).length} titles ready
          </span>
          <span>Each line = 1 video</span>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={handleBulkAdd}
          disabled={!bulkText.trim()}
        >
          <Plus className="w-4 h-4" />
          Add {bulkText.split('\n').filter(line => line.trim().length > 0).length || 0} Videos
        </Button>
      </CardContent>
    </Card>
  );
}
