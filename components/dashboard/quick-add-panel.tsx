"use client";

import React, { useState } from "react";
import { Plus, X, FileText, PlayCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ContentItem, Platform, ContentStatus } from "@/lib/content-data";
import { cn } from "@/lib/utils";

interface QuickAddPanelProps {
  onAddItems: (items: ContentItem[]) => void;
}

type PartialItem = Omit<ContentItem, "id" | "createdAt">;

export function QuickAddPanel({ onAddItems }: QuickAddPanelProps) {
  // Bulk Add State
  const [bulkText, setBulkText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<PartialItem[]>([]);
  
  // Single Add State
  const [singleTitle, setSingleTitle] = useState("");
  const [singlePlatform, setSinglePlatform] = useState<Platform>("youtube");
  const [singleStatus, setSingleStatus] = useState<ContentStatus>("idea");

  const handleParse = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split("\n").filter((l) => l.trim());
    const parsed: PartialItem[] = lines.map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      // Format: platform | title | status
      // Or just: title
      
      let platform: Platform = "youtube";
      let title = "";
      let status: ContentStatus = "idea";

      if (parts.length === 1) {
        title = parts[0];
      } else if (parts.length >= 2) {
        // Check if first part is platform
        const p1 = parts[0].toLowerCase();
        if (p1 === "youtube" || p1 === "x") {
            platform = p1 as Platform;
            title = parts[1];
            if (parts[2]) {
                status = validateStatus(parts[2]) || "idea";
            }
        } else {
            // Maybe title | status? assume youtube
            title = parts[0];
            status = validateStatus(parts[1]) || "idea";
        }
      }
      
      return {
        platform,
        title,
        status,
      };
    });

    setParsedPreview(parsed);
  };

  const validateStatus = (s: string): ContentStatus | null => {
    const valid: ContentStatus[] = ["idea", "script", "filming", "editing", "scheduled", "published"];
    const lower = s.toLowerCase() as ContentStatus;
    return valid.includes(lower) ? lower : null;
  };

  const handleBulkAdd = () => {
    const newItems: ContentItem[] = parsedPreview.map((p) => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }));
    onAddItems(newItems);
    setParsedPreview([]);
    setBulkText("");
  };

  const removePreviewItem = (index: number) => {
    setParsedPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSingleAdd = () => {
    if (!singleTitle.trim()) return;
    const newItem: ContentItem = {
      id: Math.random().toString(36).substr(2, 9),
      platform: singlePlatform,
      title: singleTitle,
      status: singleStatus,
      createdAt: new Date().toISOString(),
    };
    onAddItems([newItem]);
    setSingleTitle("");
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Bulk Add Section */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Bulk Create
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder={`Paste ideas (one per line)...\n\nExample:\nyoutube | My Video Title | idea\nx | My Tweet Thread | scheduled`}
              className="min-h-[120px] font-mono text-xs bg-background/50 border-border/50 resize-none"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleParse}
                disabled={!bulkText.trim()}
                className="text-xs h-8"
              >
                Parse Lines
              </Button>
            </div>
          </div>

          {parsedPreview.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/50">
                Preview ({parsedPreview.length} items)
              </div>
              <ScrollArea className="h-[150px]">
                <div className="p-2 space-y-2">
                  {parsedPreview.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border/30 text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Badge variant="outline" className={cn("px-1 py-0 text-[10px] uppercase", item.platform === 'youtube' ? 'border-red-500/30 text-red-400' : 'border-blue-500/30 text-blue-400')}>
                            {item.platform === 'youtube' ? 'YT' : 'X'}
                        </Badge>
                        <span className="truncate text-xs font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{item.status}</Badge>
                        <button onClick={() => removePreviewItem(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-2 border-t border-border/50 bg-muted/30">
                <Button className="w-full h-8 text-xs gap-1" onClick={handleBulkAdd}>
                    <Plus className="w-3 h-3" />
                    Add {parsedPreview.length} Items to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-border" />

      {/* Quick Single Add */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Quick Add
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <Input 
                placeholder="Enter title..." 
                value={singleTitle}
                onChange={(e) => setSingleTitle(e.target.value)}
                className="bg-background/50 border-border/50"
            />
            
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <select 
                        className="flex h-9 w-full items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        value={singlePlatform}
                        onChange={(e) => setSinglePlatform(e.target.value as Platform)}
                    >
                        <option value="youtube">YouTube</option>
                        <option value="x">X / Twitter</option>
                    </select>
                    {singlePlatform === 'youtube' ? 
                        <PlayCircle className="absolute right-3 top-2.5 w-4 h-4 text-red-500 pointer-events-none opacity-50" /> :
                        <MessageCircle className="absolute right-3 top-2.5 w-4 h-4 text-blue-500 pointer-events-none opacity-50" />
                    }
                </div>
                
                <select 
                    className="flex h-9 w-full items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={singleStatus}
                    onChange={(e) => setSingleStatus(e.target.value as ContentStatus)}
                >
                    <option value="idea">Idea</option>
                    <option value="script">Script</option>
                    <option value="filming">Filming</option>
                    <option value="editing">Editing</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                </select>
            </div>

            <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSingleAdd}
                disabled={!singleTitle.trim()}
            >
                Add Item
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

