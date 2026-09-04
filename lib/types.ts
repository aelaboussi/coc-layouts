export type HallType = "th" | "bh";

export type BaseCategory =
  | "war"
  | "farming"
  | "trophy"
  | "hybrid"
  | "progress"
  | "general"
  | "fun";

export interface BaseLayout {
  id: string;
  slug: string;
  title: string;
  hallType: HallType;
  level: number;
  category: BaseCategory;
  /** Real Supercell "OpenLayout" deep link — opens directly in-game. */
  link: string;
  description: string;
  /** Attribution to whoever originally built/curated this layout. */
  builder: string;
  /** GitHub "user/repo" if `builder` looks like one, for a clickable credit. */
  builderRepo?: string;
  tags: string[];
  addedAt: string; // ISO date
  image: string;
  /** Live, user-driven stats — see lib/ratings-store.ts. 0/0 means unrated. */
  rating: number;
  ratingCount: number;
  views: number;
}

export interface LevelSummary {
  hallType: HallType;
  level: number;
  count: number;
  label: string;
}

export const CATEGORY_LABELS: Record<BaseCategory, string> = {
  war: "War Base",
  farming: "Farming Base",
  trophy: "Trophy Push",
  hybrid: "Hybrid Base",
  progress: "Progress Base",
  general: "General Base",
  fun: "Fun / Troll Base",
};

export type SortOption = "newest" | "rating" | "views" | "oldest" | "az";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  rating: "Top Rated",
  views: "Most Viewed",
  oldest: "Oldest",
  az: "A–Z",
};
