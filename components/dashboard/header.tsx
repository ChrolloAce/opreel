"use client";

import React from "react";
import { Search, Settings, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Platform, ContentStatus } from "@/lib/content-data";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  platformFilter: Platform | "all";
  onPlatformChange: (platform: Platform | "all") => void;
  statusFilter: ContentStatus | "all";
  onStatusChange: (status: ContentStatus | "all") => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  statusFilter,
  onStatusChange,
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
        <div className="relative w-full md:w-[500px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-12 h-10 bg-input border-border rounded-full focus-visible:ring-1 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2 h-9 px-4">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full gap-2 h-8 px-4 border border-border/50">
              <Filter className="w-4 h-4" />
              <span className="capitalize text-sm">
                {statusFilter === "all" 
                  ? "All" 
                  : statusFilter === "idea" 
                    ? "Drafts"
                    : statusFilter === "editing"
                      ? "In Progress"
                      : statusFilter === "published"
                        ? "Done"
                        : statusFilter}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onStatusChange("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("idea")}>
              Drafts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("editing")}>
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("published")}>
              Done
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

