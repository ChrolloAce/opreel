"use client";

import React, { useState, useEffect } from "react";
import {
  ContentItem,
  ContentStatus,
  Platform,
  initialContentItems,
} from "@/lib/content-data";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { HeroSection } from "@/components/dashboard/hero-section";
import { ContentGrid } from "@/components/dashboard/content-grid";
import { QuickAddPanel } from "@/components/dashboard/quick-add-panel";
import { LoginScreen } from "@/components/auth/login-screen";
import { useAuth } from "@/lib/auth-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();

  // Show loading screen while checking auth
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

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  return <AuthenticatedDashboard user={user} onSignOut={signOut} />;
}

function AuthenticatedDashboard({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  // State
  const [contentItems, setContentItems] =
    useState<ContentItem[]>([]);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load content from Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const loadContent = async () => {
      try {
        const { fetchUserContent } = await import("@/lib/firebase-helpers");
        const items = await fetchUserContent(user.uid);
        setContentItems(items);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [user?.uid]);

  // Spacebar handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if spacebar is pressed and not in an input/textarea
      if (
        e.code === "Space" &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtering Logic
  const filteredItems = contentItems.filter((item) => {
    const matchesPlatform =
      platformFilter === "all" || item.platform === platformFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const handleAddItems = async (newItems: ContentItem[]) => {
    if (!user?.uid) return;
    
    setIsSaving(true);
    try {
      const { addContentItem } = await import("@/lib/firebase-helpers");
      
      // Add items to Firebase and get their IDs
      const addedItems = await Promise.all(
        newItems.map(async (item) => {
          const id = await addContentItem(user.uid, item);
          return { ...item, id };
        })
      );
      
      // Update local state
      setContentItems((prev) => [...addedItems, ...prev]);
      setIsQuickAddOpen(false);
    } catch (error) {
      console.error("Error adding items:", error);
      alert("Failed to add items. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleUpdate = async (id: string, newTitle: string) => {
    if (!user?.uid) return;
    
    // Optimistic update
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );

    try {
      const { updateContentItem } = await import("@/lib/firebase-helpers");
      await updateContentItem(user.uid, id, { title: newTitle });
    } catch (error) {
      console.error("Error updating title:", error);
      // Revert on error
      setContentItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: item.title } : item
        )
      );
    }
  };

  const handleThumbnailUpdate = async (id: string, file: File) => {
    if (!user?.uid) return;
    
    try {
      const { uploadThumbnail, updateContentItem } = await import("@/lib/firebase-helpers");
      
      // Upload to Firebase Storage
      const downloadUrl = await uploadThumbnail(user.uid, file);
      
      // Update Firestore
      await updateContentItem(user.uid, id, { thumbnailUrl: downloadUrl });
      
      // Update local state
      setContentItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, thumbnailUrl: downloadUrl } : item
        )
      );
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Failed to upload thumbnail. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    
    // Optimistic delete
    setContentItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const { deleteContentItem } = await import("@/lib/firebase-helpers");
      await deleteContentItem(user.uid, id);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please refresh.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <Sidebar
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        onPlatformChange={setPlatformFilter}
        onStatusChange={setStatusFilter}
        onSignOut={onSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-60 p-4 md:p-6 min-h-screen overflow-x-hidden">
        {/* Mobile Header / Sidebar Toggle */}
        <div className="md:hidden mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-xl">📺 Content</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-64 border-r border-border/10"
            >
              <Sidebar
                className="flex relative h-full w-full border-none"
                platformFilter={platformFilter}
                statusFilter={statusFilter}
                onPlatformChange={(p) => {
                  setPlatformFilter(p);
                }}
                onStatusChange={(s) => {
                  setStatusFilter(s);
                }}
                onSignOut={onSignOut}
              />
            </SheetContent>
          </Sheet>
        </div>

        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Full Width Grid - No Right Panel */}
        <div className="w-full">
          <HeroSection items={filteredItems} isLoading={isLoading} />
          <ContentGrid 
            items={filteredItems}
            onTitleUpdate={handleTitleUpdate}
            onThumbnailUpdate={handleThumbnailUpdate}
            onDelete={handleDelete}
          />
        </div>

        {/* Helper Text */}
        <div className="fixed bottom-6 right-6">
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground shadow-lg">
            Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-semibold">Space</kbd> to add content
          </div>
        </div>
      </main>

      {/* Quick Add Dialog - Opens with Spacebar */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
            <DialogDescription>
              {isSaving ? "Saving your videos..." : "Paste your video titles below"}
            </DialogDescription>
          </DialogHeader>
          {isSaving ? (
            <div className="flex items-center justify-center py-12">
              <Skeleton className="h-8 w-8 rounded-full animate-spin" />
            </div>
          ) : (
            <QuickAddPanel onAddItems={handleAddItems} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
