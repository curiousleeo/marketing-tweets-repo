export type Section = "marketing" | "vibe-coding";
export type Platform = "tweet" | "reel";

export type MarketingCategory =
  | "Content Strategy"
  | "Personal Branding"
  | "Community Building"
  | "Web3 Marketing"
  | "Copywriting"
  | "Growth";

export type VibeCodingCategory =
  | "AI Tools & Stacks"
  | "Prompting Tips"
  | "Workflow / Productivity"
  | "Project Ideas";

export type Category = MarketingCategory | VibeCodingCategory;

export interface Author {
  name: string;
  handle: string;
  avatar: string;
}

export interface ContentItem {
  id: string;
  platform: Platform;
  section: Section;
  text: string;
  author: Author;
  category: Category;
  date: string;
  upvotes: number;
  // Tweet-only (optional on reels)
  likes?: number;
  retweets?: number;
  bookmarks?: number;
  tweetUrl?: string;
  // Reel-only (optional on tweets)
  reelUrl?: string;
  thumbnailUrl?: string;
  contributedBy?: {
    name: string;
    handle: string;
  };
}

// Backward-compat alias
export type Tweet = ContentItem;

export interface Contributor {
  handle: string;
  name: string;
  itemsAdded: number;
  joinedDate: string;
}

export type SortOption = "date" | "upvotes";

export interface ContentData {
  items: ContentItem[];
}

// Legacy alias
export interface TweetsData {
  tweets: ContentItem[];
}
