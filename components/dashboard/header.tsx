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
        <Tabs
          value={platformFilter}
          onValueChange={(v) => onPlatformChange(v as Platform | "all")}
          className="w-auto"
        >
          <TabsList className="bg-transparent h-8 p-0 gap-1">
            <TabsTrigger 
              value="all" 
              className="rounded-full data-[state=active]:bg-card data-[state=active]:text-foreground h-8 px-4"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="youtube" 
              className="rounded-full data-[state=active]:bg-card data-[state=active]:text-foreground h-8 px-4"
            >
              YouTube
            </TabsTrigger>
            <TabsTrigger 
              value="x" 
              className="rounded-full data-[state=active]:bg-card data-[state=active]:text-foreground h-8 px-4"
            >
              X
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full gap-2 h-8 px-4 border border-border/50">
              <Filter className="w-4 h-4" />
              <span className="capitalize text-sm">
                {statusFilter === "all" ? "All" : statusFilter}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onStatusChange("all")}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("idea")}>
              Idea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("script")}>
              Script
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("filming")}>
              Filming
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("editing")}>
              Editing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("scheduled")}>
              Scheduled
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("published")}>
              Published
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

