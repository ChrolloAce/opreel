"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Library, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextSettings } from "@/components/content-library/context-settings";
import { StyleLibrary } from "@/components/content-library/style-library";
import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/auth/login-screen";
import { AISettings, ContentItem } from "@/lib/content-data";
import {
  getAISettings,
  saveAISettings,
  fetchUserContent,
} from "@/lib/firebase-helpers";

const defaultSettings: AISettings = {
  aboutYou: "",
  tone: "",
  targetAudience: "",
  contentPillars: "",
  topicsToAvoid: "",
  selectedYouTubeIds: [],
  selectedXIds: [],
};

export default function ContentLibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      
      // Load AI settings
      const aiSettings = await getAISettings(user.uid);
      if (aiSettings) {
        setSettings(aiSettings);
      }

      // Load user content for style library
      const userContent = await fetchUserContent(user.uid);
      setContent(userContent);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (newSettings: AISettings) => {
    if (!user?.uid) return;

    try {
      await saveAISettings(user.uid, newSettings);
      setSettings(newSettings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  };

  const handleSelectionChange = (youtubeIds: string[], xIds: string[]) => {
    setSettings((prev) => ({
      ...prev,
      selectedYouTubeIds: youtubeIds,
      selectedXIds: xIds,
    }));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Content Library</h1>
                <p className="text-sm text-muted-foreground">
                  Configure AI generation settings and select your style references
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <Tabs defaultValue="context" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="context" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Context Settings
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Library className="w-4 h-4" />
              Style Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="context">
            <ContextSettings settings={settings} onSave={handleSaveSettings} />
          </TabsContent>

          <TabsContent value="library">
            <StyleLibrary
              content={content}
              selectedYouTubeIds={settings.selectedYouTubeIds}
              selectedXIds={settings.selectedXIds}
              onSelectionChange={handleSelectionChange}
            />
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
          <h3 className="font-semibold mb-2">How AI Generation Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Set your context in the Context Settings tab - tell the AI about you, your style, and your goals.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Select your best content in the Style Library - the AI will analyze these to match your voice.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>In the dashboard, press spacebar and use the "AI Generate" tab to create new ideas.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

