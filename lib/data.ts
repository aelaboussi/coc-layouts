import sourceData from "@/data/coc-bases-source.json";
import { getRatingSummaries, getRatingSummary, RatingSummary } from "./ratings-store";
import {
  BaseCategory,
  BaseLayout,
  HallType,
  LevelSummary,
  SortOption,
} from "./types";

// ---------------------------------------------------------------------------
// Real content layer. Backed by data/coc-bases-source.json — a bundled copy
// of the open-source (MIT) nschmeller/clash-bases dataset: 5,162 real base
// layouts with real in-game share links, real screenshots, and real
// attribution. See ATTRIBUTION.md.
//
// Every page in the app goes through the functions exported here — swap
// this module for a real database/CMS call later and nothing else changes.
//
// Rating/view data lives separately (lib/ratings-store.ts, backed by
// Upstash Redis) and is merged in at read time, which is why most functions
// here are async — the static catalog below never changes at runtime, but
// live stats do.
// ---------------------------------------------------------------------------

interface SourceEntry {
  id: string;
  name: string;
  town_hall: number;
  type: string;
  link: string;
  description?: string;
  builder?: string;
  tags?: string[];
  added: string;
  image: string;
}

const TYPE_TO_CATEGORY: Record<string, BaseCategory> = {
  War: "war",
  Farm: "farming",
  Trophy: "trophy",
  Hybrid: "hybrid",
  Progress: "progress",
  "Home Village": "general",
  Fun: "fun",
};

const GITHUB_REPO_RE = /^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:\s|$)/;

function levelLabel(hallType: HallType, level: number) {
  return `${hallType === "th" ? "Town Hall" : "Builder Hall"} ${level}`;
}

function toBaseLayout(entry: SourceEntry): BaseLayout {
  const builder = entry.builder ?? "Community";
  const repoMatch = GITHUB_REPO_RE.exec(builder);
  return {
    id: entry.id,
    slug: entry.id,
    title: entry.name,
    hallType: "th",
    level: entry.town_hall,
    category: TYPE_TO_CATEGORY[entry.type] ?? "general",
    link: entry.link,
    description: entry.description ?? "",
    builder,
    builderRepo: repoMatch ? repoMatch[1] : undefined,
    tags: entry.tags ?? [],
    addedAt: entry.added,
    image: entry.image,
    // Placeholder zeros — real values are merged in at read time from the
    // live ratings store, never baked into the static catalog (which is
    // only rebuilt on deploy).
    rating: 0,
    ratingCount: 0,
    views: 0,
  };
}

function mergeStats(base: BaseLayout, s: RatingSummary | undefined): BaseLayout {
  return {
    ...base,
    rating: s?.average ?? 0,
    ratingCount: s?.count ?? 0,
    views: s?.views ?? 0,
  };
}

async function withStatsOne(base: BaseLayout): Promise<BaseLayout> {
  return mergeStats(base, await getRatingSummary(base.id));
}

async function withStatsMany(bases: BaseLayout[]): Promise<BaseLayout[]> {
  if (bases.length === 0) return [];
  const stats = await getRatingSummaries(bases.map((b) => b.id));
  return bases.map((b) => mergeStats(b, stats[b.id]));
}

const CATALOG: BaseLayout[] = (sourceData as { bases: SourceEntry[] }).bases
  .map(toBaseLayout)
  // newest-first is the natural default order everywhere
  .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

// Precompute a lowercase haystack once per entry so search doesn't repeat
// string work on every keystroke.
const SEARCH_INDEX = CATALOG.map((b) => ({
  base: b,
  haystack: `${b.title} ${b.category} ${levelLabel(b.hallType, b.level)} ${b.tags.join(" ")}`.toLowerCase(),
}));

const BY_SLUG = new Map(CATALOG.map((b) => [b.slug, b]));

const BY_LEVEL = new Map<string, BaseLayout[]>();
CATALOG.forEach((b) => {
  const key = `${b.hallType}-${b.level}`;
  const list = BY_LEVEL.get(key);
  if (list) list.push(b);
  else BY_LEVEL.set(key, [b]);
});

// The site's navigation covers the full range the original product did,
// even where the open dataset has no coverage yet (TH3, all Builder Hall
// levels) — those render an honest empty state instead of fake content.
const TH_RANGE = Array.from({ length: 16 }, (_, i) => i + 3); // TH3..TH18
const BH_RANGE = Array.from({ length: 8 }, (_, i) => i + 3); // BH3..BH10

export function isSupportedLevel(hallType: HallType, level: number): boolean {
  return hallType === "th" ? TH_RANGE.includes(level) : BH_RANGE.includes(level);
}

export function getAllLevels(): LevelSummary[] {
  const levels: { hallType: HallType; level: number }[] = [
    ...TH_RANGE.map((level) => ({ hallType: "th" as HallType, level })),
    ...BH_RANGE.map((level) => ({ hallType: "bh" as HallType, level })),
  ];
  return levels.map(({ hallType, level }) => ({
    hallType,
    level,
    count: BY_LEVEL.get(`${hallType}-${level}`)?.length ?? 0,
    label: levelLabel(hallType, level),
  }));
}

export function getLevels(hallType: HallType): LevelSummary[] {
  return getAllLevels().filter((l) => l.hallType === hallType);
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function paginate<T>(items: T[], page: number | undefined, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page ?? 1), totalPages);
  const start = (current - 1) * pageSize;
  return { slice: items.slice(start, start + pageSize), page: current, total, totalPages };
}

export async function getBasesForLevel(
  hallType: HallType,
  level: number,
  opts?: {
    category?: BaseCategory | "all";
    sort?: SortOption;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<BaseLayout>> {
  let items = BY_LEVEL.get(`${hallType}-${level}`) ?? [];
  if (opts?.category && opts.category !== "all") {
    items = items.filter((b) => b.category === opts.category);
  }

  const sort = opts?.sort ?? "newest";
  const pageSize = opts?.pageSize ?? 24;

  if (sort === "rating" || sort === "views") {
    // Ranking by a live stat requires that stat for every candidate before
    // we can sort — fetch the whole (already category-filtered) set in one
    // batched request. Bounded by the level's size (worst case ~535 for
    // TH17), not the full catalog. See lib/ratings-store.ts for the cost
    // tradeoff this implies against a Redis free tier.
    const withStats = await withStatsMany(items);
    withStats.sort((a, b) => {
      if (sort === "views") return b.views - a.views;
      // rating: unrated bases (0 votes) sink below any real rating instead
      // of tying with it at 0.
      if (a.ratingCount === 0 && b.ratingCount === 0) return 0;
      if (a.ratingCount === 0) return 1;
      if (b.ratingCount === 0) return -1;
      return b.rating - a.rating || b.ratingCount - a.ratingCount;
    });
    const { slice, page, total, totalPages } = paginate(withStats, opts?.page, pageSize);
    return { items: slice, page, pageSize, total, totalPages };
  }

  // newest / oldest / az: sort on static catalog fields (cheap, no I/O),
  // paginate, and only then fetch live stats for the ~24 items actually
  // being displayed.
  const sorted = [...items].sort((a, b) => {
    if (sort === "oldest") {
      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
    }
    if (sort === "az") return a.title.localeCompare(b.title);
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(); // newest
  });
  const { slice, page, total, totalPages } = paginate(sorted, opts?.page, pageSize);
  return { items: await withStatsMany(slice), page, pageSize, total, totalPages };
}

export function hasBase(id: string): boolean {
  return BY_SLUG.has(id);
}

/** Raw catalog entries for a level, with no live stats merged in and no
 * pagination — for bulk/structural use (app/sitemap.ts) that only needs
 * urls and dates, not ratings. Fetching stats for an entire level (up to
 * ~535 bases) just to build a sitemap would be a lot of wasted Redis calls
 * for data the sitemap never uses. */
export function getCatalogForLevel(hallType: HallType, level: number): BaseLayout[] {
  return BY_LEVEL.get(`${hallType}-${level}`) ?? [];
}

export async function getBaseBySlug(
  hallType: HallType,
  level: number,
  slug: string
): Promise<BaseLayout | undefined> {
  const base = BY_SLUG.get(slug);
  if (!base || base.hallType !== hallType || base.level !== level) return undefined;
  return withStatsOne(base);
}

export async function getRelatedBases(base: BaseLayout, count = 4): Promise<BaseLayout[]> {
  const siblings = BY_LEVEL.get(`${base.hallType}-${base.level}`) ?? [];
  const sameCategory = siblings.filter(
    (b) => b.id !== base.id && b.category === base.category
  );
  const rest = siblings.filter(
    (b) => b.id !== base.id && b.category !== base.category
  );
  return withStatsMany([...sameCategory, ...rest].slice(0, count));
}

export async function getRecentlyAdded(count = 8): Promise<BaseLayout[]> {
  return withStatsMany(CATALOG.slice(0, count));
}

export function getTotalBaseCount(): number {
  return CATALOG.length;
}

/** A representative real screenshot for a level, used on the homepage's
 * level cards. `undefined` when there's no real content for that level yet
 * (Builder Hall, TH3) — callers should fall back to a "coming soon" tile
 * rather than a fake image. */
export function getLevelPreviewImage(
  hallType: HallType,
  level: number
): string | undefined {
  return BY_LEVEL.get(`${hallType}-${level}`)?.[0]?.image;
}

// Not async, and deliberately doesn't merge in live rating/view stats: the
// only consumer (app/api/search/route.ts) returns a lite id/title/href
// shape for the search dropdown, so fetching stats here would just be a
// wasted Redis round trip on every keystroke.
export function searchBases(query: string, limit = 20): BaseLayout[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: BaseLayout[] = [];
  for (const entry of SEARCH_INDEX) {
    if (entry.haystack.includes(q)) {
      results.push(entry.base);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export { levelLabel };
