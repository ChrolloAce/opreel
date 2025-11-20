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
  detailedInstructions: string;
  tone: string;
  targetAudience: string;
  contentPillars: string;
  topicsToAvoid: string;
  selectedYouTubeIds: string[];
  selectedXIds: string[];
}

export type ContentCategory = 
  | "case-study"
  | "personal-results"
  | "step-by-step"
  | "contrarian"
  | "tutorial"
  | "comparison";

export const CONTENT_CATEGORIES: { value: ContentCategory; label: string; description: string }[] = [
  {
    value: "case-study",
    label: "Case Study",
    description: "Real examples and success stories (e.g., 'I Built This App in 14 Days...')"
  },
  {
    value: "personal-results",
    label: "Personal Results",
    description: "Your achievements and milestones (e.g., 'How I Went From Broke To Retiring My Mom')"
  },
  {
    value: "step-by-step",
    label: "Step-by-Step",
    description: "Guides and tutorials (e.g., 'The No BS Guide To Quit Your Job')"
  },
  {
    value: "contrarian",
    label: "Contrarian Take",
    description: "Bold statements and hot takes (e.g., 'The Gold Rush Is Here...')"
  },
  {
    value: "tutorial",
    label: "Tutorial",
    description: "How-to and instructional content (e.g., 'How To Go From 0 to 1,000 Users')"
  },
  {
    value: "comparison",
    label: "Comparison",
    description: "Before/after and comparisons (e.g., 'I Cloned a $300M/Year App')"
  }
];

export const initialContentItems: ContentItem[] = [];

