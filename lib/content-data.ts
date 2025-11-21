export type Platform = "youtube" | "x";

export type ContentStatus =
  | "idea"
  | "script"
  | "filming"
  | "editing"
  | "scheduled"
  | "published";

export interface ScriptSection {
  id: string;
  type: "hook" | "intro" | "main" | "cta" | "notes";
  content: string; // Rich text HTML
  order: number;
}

export interface ScriptVersion {
  id: string;
  content: ScriptSection[];
  createdAt: string;
  label: string; // e.g., "v1", "v2", "final"
}

export interface ContentItem {
  id: string;
  platform: Platform;
  title: string;
  thumbnailUrl?: string;
  url?: string;
  status: ContentStatus;
  createdAt: string; // ISO strings
  scheduledFor?: string;
  views?: number;
  notes?: string;
  // Script editor data
  script?: {
    sections: ScriptSection[];
    currentVersion: string; // version id
    versions: ScriptVersion[];
    wordCount: number;
    lastEditedAt: string;
  };
}

export interface AISettings {
  aboutYou: string;
  detailedInstructions: string;
  tone: string;
  targetAudience: string;
  contentPillars: string;
  topicsToAvoid: string;
  selectedYouTubeIds: string[];
  selectedXIds: string[];
}

export interface TeamMember {
  email: string;
  addedAt: string;
  addedBy: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  teamMembers: string[]; // Array of user IDs who have access to this user's content
}

export const initialContentItems: ContentItem[] = [];

