"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/lib/content-data";
import { getUserProfile, getAccessibleWorkspaces } from "@/lib/team-helpers";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  currentUserId: string;
  activeWorkspaceId: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
  currentUserId,
  activeWorkspaceId,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [accessibleWorkspaces, setAccessibleWorkspaces] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, [currentUserId]);

  const loadWorkspaces = async () => {
    try {
      const [profile, workspaces] = await Promise.all([
        getUserProfile(currentUserId),
        getAccessibleWorkspaces(currentUserId),
      ]);
      
      setMyProfile(profile);
      setAccessibleWorkspaces(workspaces);
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !myProfile) {
    return null;
  }

  // If user has no accessible workspaces, don't show the switcher
  if (accessibleWorkspaces.length === 0) {
    return null;
  }

  const activeWorkspace =
    activeWorkspaceId === currentUserId
      ? myProfile
      : accessibleWorkspaces.find((w) => w.uid === activeWorkspaceId) || myProfile;

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-2 px-3"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={activeWorkspace.photoURL} />
              <AvatarFallback className="text-xs">
                {getInitials(activeWorkspace.displayName, activeWorkspace.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium truncate w-full">
                {activeWorkspace.uid === currentUserId
                  ? "My Workspace"
                  : activeWorkspace.displayName || activeWorkspace.email}
              </span>
              {activeWorkspace.uid !== currentUserId && (
                <span className="text-xs text-muted-foreground truncate w-full">
                  Shared with you
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="start">
        {/* My Workspace */}
        <DropdownMenuItem
          onClick={() => onWorkspaceChange(currentUserId)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={myProfile.photoURL} />
            <AvatarFallback className="text-xs">
              {getInitials(myProfile.displayName, myProfile.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium">My Workspace</span>
            <span className="text-xs text-muted-foreground truncate">
              {myProfile.email}
            </span>
          </div>
          {activeWorkspaceId === currentUserId && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>

        {accessibleWorkspaces.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Shared Workspaces
              </p>
            </div>
          </>
        )}

        {/* Accessible Workspaces */}
        {accessibleWorkspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.uid}
            onClick={() => onWorkspaceChange(workspace.uid)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={workspace.photoURL} />
              <AvatarFallback className="text-xs">
                {getInitials(workspace.displayName, workspace.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">
                {workspace.displayName || workspace.email}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {workspace.email}
              </span>
            </div>
            {activeWorkspaceId === workspace.uid && (
              <Check className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

