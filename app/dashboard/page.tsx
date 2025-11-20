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
    useState<ContentItem[]>(initialContentItems);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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

  const handleAddItems = (newItems: ContentItem[]) => {
    // Prepend new items
    setContentItems((prev) => [...newItems, ...prev]);
    setIsQuickAddOpen(false);
  };

  const handleTitleUpdate = (id: string, newTitle: string) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  };

  const handleThumbnailUpdate = (id: string, newUrl: string) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, thumbnailUrl: newUrl } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <Sidebar
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        onPlatformChange={setPlatformFilter}
        onStatusChange={setStatusFilter}
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

        {/* Helper Text & User Info */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 items-end">
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground shadow-lg">
            Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-semibold">Space</kbd> to add content
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-3 shadow-lg">
            <img 
              src={user.photoURL || ''} 
              alt={user.displayName || 'User'} 
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{user.displayName}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={onSignOut}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Quick Add Dialog - Opens with Spacebar */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
            <DialogDescription>
              Quickly add single items or bulk paste multiple content ideas.
            </DialogDescription>
          </DialogHeader>
          <QuickAddPanel onAddItems={handleAddItems} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
