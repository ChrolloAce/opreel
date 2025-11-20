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

export const initialContentItems: ContentItem[] = [
  {
    id: "1",
    platform: "youtube",
    title: "I Built This App in 14 Days… Now It Makes $30K/Month",
    status: "published",
    createdAt: "2023-11-01T10:00:00Z",
    views: 52000,
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    url: "https://youtube.com",
  },
  {
    id: "2",
    platform: "youtube",
    title: "The Gold Rush Is Here: Build an AI App in 48 Hours and Quit Your Job",
    status: "scheduled",
    createdAt: "2023-11-15T14:00:00Z",
    scheduledFor: "2023-11-24T10:00:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80",
  },
  {
    id: "3",
    platform: "youtube",
    title: "Just dropped the new update for the dashboard. It's cleaner, faster, and now supports dark mode by default. 🚀 #indiehackers #buildinpublic",
    status: "published",
    createdAt: "2023-11-18T09:30:00Z",
    views: 1200,
    url: "https://youtube.com",
  },
  {
    id: "4",
    platform: "youtube",
    title: "I Vibe-Coded an App That Makes $1,000/Day While I Sleep",
    status: "editing",
    createdAt: "2023-11-20T08:00:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
  },
  {
    id: "5",
    platform: "youtube",
    title: "Thinking about switching from React to Vue for my next project. Thoughts? 🤔",
    status: "idea",
    createdAt: "2023-11-21T11:15:00Z",
  },
  {
    id: "6",
    platform: "youtube",
    title: "Coding ASMR: Building a SaaS from Scratch (No Talking)",
    status: "idea",
    createdAt: "2023-11-21T12:00:00Z",
  },
  {
    id: "7",
    platform: "youtube",
    title: "Stop Using useEffect WRONG! (React Best Practices 2024)",
    status: "script",
    createdAt: "2023-11-22T09:00:00Z",
  },
  {
    id: "8",
    platform: "youtube",
    title: "My MRR just hit $5k! Here is exactly how I did it 👇",
    status: "scheduled",
    createdAt: "2023-11-22T15:00:00Z",
    scheduledFor: "2023-11-25T08:00:00Z",
  },
  {
    id: "9",
    platform: "youtube",
    title: "React vs. Svelte vs. Vue: The Ultimate Showdown",
    status: "filming",
    createdAt: "2023-11-19T13:00:00Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  },
  {
    id: "10",
    platform: "youtube",
    title: "Why I rejected a $150k job offer to build my own startup.",
    status: "idea",
    createdAt: "2023-11-20T10:00:00Z",
  },
  {
    id: "11",
    platform: "youtube",
    title: "Day in the Life of a Software Engineer in NYC 2024",
    status: "idea",
    createdAt: "2023-11-22T16:00:00Z",
  },
  {
    id: "12",
    platform: "youtube",
    title: "How to Center a Div (The Right Way)",
    status: "published",
    createdAt: "2023-10-15T10:00:00Z",
    views: 150000,
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    url: "https://youtube.com",
  },
  {
    id: "13",
    platform: "youtube",
    title: "Design is intelligence made visible. - Alina Wheeler",
    status: "published",
    createdAt: "2023-11-10T08:00:00Z",
    views: 500,
  },
  {
    id: "14",
    platform: "youtube",
    title: "Next.js 15 Tutorial for Beginners",
    status: "script",
    createdAt: "2023-11-23T09:00:00Z",
  },
  {
    id: "15",
    platform: "youtube",
    title: "If you are not using AI in 2025, you are falling behind.",
    status: "idea",
    createdAt: "2023-11-23T10:00:00Z",
  },
];

