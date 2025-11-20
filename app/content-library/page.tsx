"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Library } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ContextSettings } from "@/components/content-library/context-settings";
import { StyleLibrary } from "@/components/content-library/style-library";
import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/auth/login-screen";
import { AISettings, ContentItem, Platform, ContentStatus } from "@/lib/content-data";
import { Skeleton } from "@/components/ui/skeleton";
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

  return <AuthenticatedContentLibrary user={user} onSignOut={signOut} />;
}

function AuthenticatedContentLibrary({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      
      const [aiSettings, userContent] = await Promise.all([
        getAISettings(user.uid),
        fetchUserContent(user.uid)
      ]);

      if (aiSettings) {
        setSettings(aiSettings);
      }
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        onPlatformChange={setPlatformFilter}
        onStatusChange={setStatusFilter}
        onSignOut={onSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-60">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Content Library</h1>
            <p className="text-muted-foreground">
              Configure AI generation settings and select your style references
            </p>
          </div>

          {/* Tabs */}
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
      </main>
    </div>
  );
}

