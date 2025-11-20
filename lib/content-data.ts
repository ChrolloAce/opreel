export type Platform = "youtube" | "x";

export type ContentStatus =
  | "idea"
  | "script"
  | "filming"
  | "editing"
  | "scheduled"
  | "published";

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
}

export interface AISettings {
  aboutYou: string;
  tone: string;
  targetAudience: string;
  contentPillars: string;
  topicsToAvoid: string;
  selectedYouTubeIds: string[];
  selectedXIds: string[];
}

export const initialContentItems: ContentItem[] = [];

