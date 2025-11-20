"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Youtube, Twitter, Loader2, Plus, RefreshCw, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/auth/login-screen";
import { useUserSettings } from "@/lib/use-user-settings";
import { 
  Platform, 
  ContentStatus, 
  AISettings, 
  ContentItem 
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
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [userContent, setUserContent] = useState<ContentItem[]>([]);
  
  // User settings for profile pics
  const { settings: userSettings } = useUserSettings(user?.uid);
  
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
          customPrompt: customPrompt.trim(),
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

                  {/* Custom Prompt (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="customPrompt">Custom Prompt (Optional)</Label>
                    <Textarea
                      id="customPrompt"
                      placeholder="e.g., 'Focus on monetization strategies' or 'Make them about building in public' or 'Include specific dollar amounts'"
                      className="min-h-[100px] resize-y"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add specific instructions to guide the AI generation
                    </p>
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
                              </div>

                              {/* Video Info */}
                              <div className="p-3 bg-card border-t border-border">
                                <div className="flex gap-3">
                                  {/* Channel Avatar */}
                                  {userSettings.youtubeAvatar ? (
                                    <img
                                      src={userSettings.youtubeAvatar}
                                      alt="Channel"
                                      className="w-9 h-9 rounded-full flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                      YT
                                    </div>
                                  )}
                                  
                                  {/* Title and Channel Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                                      {idea}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <span>{userSettings.youtubeHandle || "@YourChannel"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // X/Twitter Card Style - Exact Match
                            <div
                              key={index}
                              className={cn(
                                "relative cursor-pointer group transition-all bg-[#000000] border-b border-[#2f3336]",
                                selectedIdeas.has(index) && "ring-2 ring-primary"
                              )}
                              onClick={() => toggleIdeaSelection(index)}
                            >
                              <div className="p-4 hover:bg-[#080808] transition-colors">
                                <div className="flex gap-3">
                                  {/* Avatar */}
                                  {userSettings.xAvatar ? (
                                    <img
                                      src={userSettings.xAvatar}
                                      alt="Profile"
                                      className="w-10 h-10 rounded-full flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                      {(userSettings.xHandle?.replace("@", "")[0] || "X").toUpperCase()}
                                    </div>
                                  )}

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="font-bold text-[15px] text-[#e7e9ea]">
                                          {userSettings.xHandle?.replace("@", "") || "Your Name"}
                                        </span>
                                        <span className="text-[15px] text-[#71767b]">
                                          {userSettings.xHandle || "@yourhandle"}
                                        </span>
                                        <span className="text-[#71767b]">·</span>
                                        <span className="text-[15px] text-[#71767b]">now</span>
                                      </div>

                                      {/* Checkbox */}
                                      <div className={cn(
                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                        selectedIdeas.has(index)
                                          ? "border-primary bg-primary"
                                          : "border-[#2f3336] group-hover:border-primary"
                                      )}>
                                        {selectedIdeas.has(index) && (
                                          <Check className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                    </div>

                                    {/* Tweet Text */}
                                    <p className="text-[15px] text-[#e7e9ea] leading-5 whitespace-pre-wrap mb-3">
                                      {idea}
                                    </p>

                                    {/* Engagement Bar */}
                                    <div className="flex items-center justify-between max-w-[425px] -ml-2 mt-3">
                                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] transition-colors p-2 rounded-full hover:bg-[#1d9bf01a]">
                                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                                          <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
                                        </svg>
                                      </button>
                                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#00ba7c] transition-colors p-2 rounded-full hover:bg-[#00ba7c1a]">
                                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                                          <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
                                        </svg>
                                      </button>
                                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#f91880] transition-colors p-2 rounded-full hover:bg-[#f918801a]">
                                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                                          <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
                                        </svg>
                                      </button>
                                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] transition-colors p-2 rounded-full hover:bg-[#1d9bf01a]">
                                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                                          <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
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

