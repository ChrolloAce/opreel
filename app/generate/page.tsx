"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Youtube, Twitter, Loader2, Plus, RefreshCw, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/auth/login-screen";
import { 
  Platform, 
  ContentStatus, 
  AISettings, 
  ContentItem,
  ContentCategory,
  CONTENT_CATEGORIES 
} from "@/lib/content-data";
import { getAISettings, fetchUserContent, addContentItem } from "@/lib/firebase-helpers";
import { cn } from "@/lib/utils";

export default function GeneratePage() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AuthenticatedGenerate user={user} onSignOut={signOut} />;
}

function AuthenticatedGenerate({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const router = useRouter();
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  
  // Generation settings
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [quantity, setQuantity] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | "mixed">("mixed");
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [userContent, setUserContent] = useState<ContentItem[]>([]);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      const [settings, content] = await Promise.all([
        getAISettings(user.uid),
        fetchUserContent(user.uid)
      ]);
      
      setAiSettings(settings);
      setUserContent(content);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleGenerate = async () => {
    if (!aiSettings || isGenerating) return;

    setIsGenerating(true);
    setGeneratedIdeas([]);
    setSelectedIdeas(new Set());

    try {
      const selectedContent = userContent.filter((item) =>
        item.platform === platform
          ? platform === "youtube"
            ? aiSettings.selectedYouTubeIds.includes(item.id)
            : aiSettings.selectedXIds.includes(item.id)
          : false
      );

      const styleExamples = selectedContent.map((item) => item.title).slice(0, 15);

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          quantity,
          category: selectedCategory,
          userContext: {
            aboutYou: aiSettings.aboutYou,
            detailedInstructions: aiSettings.detailedInstructions,
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
      setSelectedIdeas(new Set(data.ideas.map((_: string, i: number) => i)));
    } catch (error: any) {
      console.error("Error generating content:", error);
      alert(error.message || "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToDashboard = async () => {
    if (!user?.uid || selectedIdeas.size === 0) return;

    setIsAdding(true);
    try {
      const ideasToAdd = Array.from(selectedIdeas)
        .map((index) => generatedIdeas[index])
        .filter(Boolean);

      for (const title of ideasToAdd) {
        const item: Omit<ContentItem, "id"> = {
          platform,
          title,
          status: "idea",
          createdAt: new Date().toISOString(),
        };
        await addContentItem(user.uid, item);
      }

      alert(`Successfully added ${ideasToAdd.length} ideas to your dashboard!`);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error adding to dashboard:", error);
      alert("Failed to add ideas. Please try again.");
    } finally {
      setIsAdding(false);
    }
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

  const selectAll = () => {
    setSelectedIdeas(new Set(generatedIdeas.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelectedIdeas(new Set());
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        onPlatformChange={setPlatformFilter}
        onStatusChange={setStatusFilter}
        onSignOut={onSignOut}
      />

      <main className="flex-1 md:ml-60">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              AI Content Generator
            </h1>
            <p className="text-muted-foreground">
              Generate content ideas powered by AI, based on your style and context
            </p>
          </div>

          {!aiSettings?.aboutYou ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">AI Not Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up your AI context and style references first.
                  </p>
                  <Button onClick={() => router.push("/content-library")}>
                    Go to Content Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-[1fr,2fr] gap-6">
              {/* Settings Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generation Settings</CardTitle>
                  <CardDescription>
                    Configure what type of content to generate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform */}
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                      <TabsList className="w-full">
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
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Content Category</Label>
                    <div className="grid gap-2">
                      <button
                        onClick={() => setSelectedCategory("mixed")}
                        className={cn(
                          "px-3 py-2 text-left rounded-lg border transition-colors text-sm",
                          selectedCategory === "mixed"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="font-medium">Mixed (All Categories)</div>
                        <div className="text-xs text-muted-foreground">
                          Generate diverse content across all types
                        </div>
                      </button>
                      {CONTENT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={cn(
                            "px-3 py-2 text-left rounded-lg border transition-colors text-sm",
                            selectedCategory === cat.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="font-medium">{cat.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {cat.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of Ideas</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 10)))}
                    />
                    <p className="text-xs text-muted-foreground">1-50 ideas</p>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Ideas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Generated Ideas</CardTitle>
                      <CardDescription>
                        {generatedIdeas.length > 0
                          ? `${selectedIdeas.size} of ${generatedIdeas.length} selected`
                          : "Click generate to create ideas"}
                      </CardDescription>
                    </div>
                    {generatedIdeas.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAll}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={deselectAll}
                        >
                          Deselect All
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedIdeas.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">No ideas generated yet</p>
                      <p className="text-xs mt-1">
                        Configure settings and click Generate Ideas
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto mb-4 pr-2">
                        {generatedIdeas.map((idea, index) => (
                          platform === "youtube" ? (
                            // YouTube Video Card Style
                            <div
                              key={index}
                              className={cn(
                                "relative rounded-lg overflow-hidden cursor-pointer group transition-all",
                                selectedIdeas.has(index)
                                  ? "ring-2 ring-primary shadow-lg"
                                  : "hover:shadow-md"
                              )}
                              onClick={() => toggleIdeaSelection(index)}
                            >
                              {/* Thumbnail Area */}
                              <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                {/* Play icon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                  </div>
                                </div>

                                {/* Checkbox */}
                                <div className="absolute top-2 right-2 z-10">
                                  <div className={cn(
                                    "w-6 h-6 rounded border-2 flex items-center justify-center transition-all backdrop-blur-sm",
                                    selectedIdeas.has(index)
                                      ? "border-primary bg-primary"
                                      : "border-white bg-black/40 group-hover:border-primary"
                                  )}>
                                    {selectedIdeas.has(index) && (
                                      <Check className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                </div>

                                {/* Index badge */}
                                <div className="absolute bottom-2 right-2">
                                  <Badge variant="secondary" className="bg-black/80 text-white border-0 text-xs">
                                    #{index + 1}
                                  </Badge>
                                </div>
                              </div>

                              {/* Video Info */}
                              <div className="p-3 bg-card border-t border-border">
                                <p className="text-sm font-medium leading-tight line-clamp-2">
                                  {idea}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Youtube className="w-4 h-4 text-red-500" />
                                  <span>YouTube Video</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // X/Twitter Card Style
                            <div
                              key={index}
                              className={cn(
                                "relative rounded-xl overflow-hidden cursor-pointer group transition-all bg-[#000000] border",
                                selectedIdeas.has(index)
                                  ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                  : "border-[#2f3336] hover:border-primary/50"
                              )}
                              onClick={() => toggleIdeaSelection(index)}
                            >
                              <div className="p-3">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white text-xs font-semibold">
                                      X
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-bold text-[#e7e9ea]">Your Name</span>
                                      <span className="text-[13px] text-[#71767b]">@yourhandle</span>
                                    </div>
                                  </div>

                                  {/* Checkbox */}
                                  <div className={cn(
                                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                    selectedIdeas.has(index)
                                      ? "border-primary bg-primary"
                                      : "border-[#2f3336] group-hover:border-primary"
                                  )}>
                                    {selectedIdeas.has(index) && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                </div>

                                {/* Tweet Content */}
                                <p className="text-[13px] text-[#e7e9ea] leading-[18px] whitespace-pre-wrap mb-3 min-h-[60px]">
                                  {idea}
                                </p>

                                {/* Engagement Icons */}
                                <div className="flex items-center gap-4 text-[#71767b]">
                                  <div className="flex items-center gap-1 text-xs">
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center">
                                      💬
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center">
                                      🔁
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center">
                                      ❤️
                                    </div>
                                  </div>
                                </div>

                                {/* Index badge */}
                                <div className="absolute top-2 left-2">
                                  <Badge variant="secondary" className="bg-[#1d9bf0] text-white border-0 text-xs">
                                    #{index + 1}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleAddToDashboard}
                          disabled={selectedIdeas.size === 0 || isAdding}
                          className="flex-1 gap-2"
                          size="lg"
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Add {selectedIdeas.size} to Dashboard
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          variant="outline"
                          size="lg"
                          className="gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

