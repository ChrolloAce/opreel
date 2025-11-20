"use client";

import React, { useState } from "react";
import { Plus, Youtube, Twitter, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentItem, Platform, AISettings } from "@/lib/content-data";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuickAddPanelProps {
  onAddItems: (items: ContentItem[]) => void;
  aiSettings?: AISettings | null;
  userContent: ContentItem[];
}

export function QuickAddPanel({ onAddItems, aiSettings, userContent }: QuickAddPanelProps) {
  const [activeTab, setActiveTab] = useState<"bulk" | "ai">("bulk");
  const [bulkText, setBulkText] = useState("");
  const [platform, setPlatform] = useState<Platform>("youtube");
  
  // AI Generation state
  const [aiPlatform, setAiPlatform] = useState<Platform>("youtube");
  const [quantity, setQuantity] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set());

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

  const handleAIGenerate = async () => {
    if (!aiSettings || isGenerating) return;

    setIsGenerating(true);
    setGeneratedIdeas([]);
    setSelectedIdeas(new Set());

    try {
      // Get style examples from selected content
      const selectedContent = userContent.filter((item) =>
        item.platform === aiPlatform
          ? aiPlatform === "youtube"
            ? aiSettings.selectedYouTubeIds.includes(item.id)
            : aiSettings.selectedXIds.includes(item.id)
          : false
      );

      const styleExamples = selectedContent.map((item) => item.title).slice(0, 10);

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: aiPlatform,
          quantity,
          userContext: {
            aboutYou: aiSettings.aboutYou,
            tone: aiSettings.tone,
            targetAudience: aiSettings.targetAudience,
            contentPillars: aiSettings.contentPillars,
            topicsToAvoid: aiSettings.topicsToAvoid,
          },
          styleExamples,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate content");
      }

      const data = await response.json();
      setGeneratedIdeas(data.ideas);
      // Select all by default
      setSelectedIdeas(new Set(data.ideas.map((_: string, i: number) => i)));
    } catch (error: any) {
      console.error("Error generating content:", error);
      alert(error.message || "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSelectedIdeas = () => {
    const ideasToAdd = Array.from(selectedIdeas)
      .map((index) => generatedIdeas[index])
      .filter(Boolean);

    if (ideasToAdd.length === 0) return;

    const newItems: ContentItem[] = ideasToAdd.map((title) => ({
      id: Math.random().toString(36).substr(2, 9),
      platform: aiPlatform,
      title: title,
      status: "idea",
      createdAt: new Date().toISOString(),
    }));

    onAddItems(newItems);
    setGeneratedIdeas([]);
    setSelectedIdeas(new Set());
  };

  const toggleIdeaSelection = (index: number) => {
    const newSelected = new Set(selectedIdeas);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIdeas(newSelected);
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
          Bulk paste or use AI to generate ideas
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "bulk" | "ai")}>
          <TabsList className="w-full bg-muted mb-4">
            <TabsTrigger value="bulk" className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Bulk Paste
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 gap-2">
              <Sparkles className="w-4 h-4" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          {/* Bulk Paste Tab */}
          <TabsContent value="bulk" className="space-y-4 mt-0">
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
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="ai" className="space-y-4 mt-0">
            {!aiSettings?.aboutYou ? (
              <div className="text-center py-8 space-y-3">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">AI Generation Not Configured</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visit Content Library to set up your AI context and style references.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/content-library"}
                >
                  Go to Content Library
                </Button>
              </div>
            ) : (
              <>
                <Tabs value={aiPlatform} onValueChange={(v) => setAiPlatform(v as Platform)}>
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

                <div className="space-y-2">
                  <Label htmlFor="quantity">How many ideas?</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 10)))}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Generate 1-50 ideas at once
                  </p>
                </div>

                {generatedIdeas.length === 0 ? (
                  <Button
                    className="w-full gap-2"
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Generated Ideas ({selectedIdeas.size} selected)</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGeneratedIdeas([])}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <ScrollArea className="h-[300px] border rounded-md p-3 bg-background/50">
                        <div className="space-y-2">
                          {generatedIdeas.map((idea, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                              onClick={() => toggleIdeaSelection(index)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIdeas.has(index)}
                                onChange={() => toggleIdeaSelection(index)}
                                className="mt-1"
                              />
                              <span className="text-sm flex-1">{idea}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <Button
                      className="w-full gap-2"
                      onClick={handleAddSelectedIdeas}
                      disabled={selectedIdeas.size === 0}
                    >
                      <Plus className="w-4 h-4" />
                      Add {selectedIdeas.size} Selected
                    </Button>
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
