"use client";

import React from "react";
import {
  LayoutGrid,
  Calendar,
  Library,
  BarChart3,
  Youtube,
  Twitter,
  Lightbulb,
  Clock,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Platform, ContentStatus } from "@/lib/content-data";

interface SidebarProps {
  className?: string;
  platformFilter: Platform | "all";
  statusFilter: ContentStatus | "all";
  onPlatformChange: (platform: Platform | "all") => void;
  onStatusChange: (status: ContentStatus | "all") => void;
}

export function Sidebar({
  className,
  platformFilter,
  statusFilter,
  onPlatformChange,
  onStatusChange,
}: SidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-screen w-60 border-r border-sidebar-border bg-sidebar text-sidebar-foreground fixed left-0 top-0 z-30 hidden md:flex",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <span className="text-primary">📺</span> Content Studio
        </h1>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Menu
            </h2>
            <div className="space-y-1">
              <SidebarItem
                icon={<LayoutGrid className="w-4 h-4" />}
                label="Dashboard"
                isActive={true}
                onClick={() => {}}
              />
              <SidebarItem
                icon={<Calendar className="w-4 h-4" />}
                label="Calendar"
                isActive={false}
                onClick={() => {}}
              />
              <SidebarItem
                icon={<Library className="w-4 h-4" />}
                label="Content Library"
                isActive={false}
                onClick={() => {}}
              />
              <SidebarItem
                icon={<BarChart3 className="w-4 h-4" />}
                label="Analytics"
                isActive={false}
                onClick={() => {}}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Filters
            </h2>
            <div className="space-y-1">
              <SidebarItem
                icon={<Layers className="w-4 h-4" />}
                label="All Content"
                isActive={platformFilter === "all" && statusFilter === "all"}
                onClick={() => {
                  onPlatformChange("all");
                  onStatusChange("all");
                }}
              />
              <SidebarItem
                icon={<Youtube className="w-4 h-4 text-red-500" />}
                label="YouTube"
                isActive={platformFilter === "youtube"}
                onClick={() => onPlatformChange("youtube")}
              />
              <SidebarItem
                icon={<Twitter className="w-4 h-4 text-blue-400" />}
                label="X / Twitter"
                isActive={platformFilter === "x"}
                onClick={() => onPlatformChange("x")}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Status
            </h2>
            <div className="space-y-1">
              <SidebarItem
                icon={<Lightbulb className="w-4 h-4 text-yellow-500" />}
                label="Ideas"
                isActive={statusFilter === "idea"}
                onClick={() => onStatusChange("idea")}
              />
              <SidebarItem
                icon={<Clock className="w-4 h-4 text-purple-500" />}
                label="Scheduled"
                isActive={statusFilter === "scheduled"}
                onClick={() => onStatusChange("scheduled")}
              />
              <SidebarItem
                icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
                label="Published"
                isActive={statusFilter === "published"}
                onClick={() => onStatusChange("published")}
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-semibold text-white">
            EL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Ernesto Lopez</span>
            <span className="text-xs text-muted-foreground">Creator</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, isActive, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-normal transition-colors duration-150",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

