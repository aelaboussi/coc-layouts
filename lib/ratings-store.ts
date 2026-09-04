import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Real, user-driven ratings and view counts — not fabricated numbers. Every
// base starts at "not yet rated" / 0 views and only grows from genuine
// visitor interaction (star clicks on the detail page, real page loads).
//
// Storage: Upstash Redis over its HTTP/REST API. That specifically (not a
// traditional database) is what makes this work on Vercel/Netlify: it's a
// plain `fetch()` call under the hood, so it runs fine from a serverless
// function or edge runtime with no persistent connection and no server for
// you to provision — closer to "an API you call" than "a database you run".
// Free tier is generous enough for a small-to-medium site.
//
// Setup: create a free database at upstash.com (or add the Upstash
// integration from your Vercel project's Storage tab, which injects the env
// vars automatically), then set UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN — in `.env.local` for local dev, and in your
// host's environment variable settings for Vercel/Netlify/etc.
//
// Local dev without those env vars: falls back to a plain in-memory Map so
// `npm run dev` works with zero setup. That fallback is NOT persisted
// (resets on every restart) and is NOT shared across serverless instances —
// it exists purely so you're not forced to create an Upstash account before
// you can even look at the site.
// ---------------------------------------------------------------------------

export interface RatingSummary {
  average: number; // 0 when count === 0
  count: number;
  views: number;
}

interface RatingRecord {
  sum: number;
  count: number;
  views: number;
}

const EMPTY: RatingSummary = { average: 0, count: 0, views: 0 };

function summarize(rec: Partial<RatingRecord> | null | undefined): RatingSummary {
  const sum = Number(rec?.sum ?? 0);
  const count = Number(rec?.count ?? 0);
  const views = Number(rec?.views ?? 0);
  return {
    average: count ? Math.round((sum / count) * 10) / 10 : 0,
    count,
    views,
  };
}

const key = (id: string) => `rating:${id}`;

// Upstash's pipeline is one HTTP request for many commands, but very large
// pipelines are still best chunked — this keeps each request a reasonable
// size regardless of how big a single Town Hall level's roster gets.
const BATCH_SIZE = 200;
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ---------------------------------------------------------------------------
// Backend selection
// ---------------------------------------------------------------------------

interface Backend {
  getMany(ids: string[]): Promise<Record<string, RatingSummary>>;
  submitRating(id: string, value: number): Promise<RatingSummary>;
  recordView(id: string): Promise<void>;
}

function createRedisBackend(): Backend {
  const redis = Redis.fromEnv();

  return {
    async getMany(ids) {
      if (ids.length === 0) return {};
      const out: Record<string, RatingSummary> = {};
      for (const group of chunk(ids, BATCH_SIZE)) {
        const pipeline = redis.pipeline();
        group.forEach((id) => pipeline.hgetall(key(id)));
        const results = (await pipeline.exec()) as (Partial<RatingRecord> | null)[];
        group.forEach((id, i) => {
          out[id] = summarize(results[i]);
        });
      }
      return out;
    },

    async submitRating(id, value) {
      const pipeline = redis.pipeline();
      pipeline.hincrby(key(id), "sum", value);
      pipeline.hincrby(key(id), "count", 1);
      const [sum, count] = (await pipeline.exec()) as [number, number];
      const rec = await redis.hgetall<Partial<RatingRecord>>(key(id));
      return summarize({ sum, count, views: rec?.views ?? 0 });
    },

    async recordView(id) {
      await redis.hincrby(key(id), "views", 1);
    },
  };
}

function createMemoryBackend(): Backend {
  const store = new Map<string, RatingRecord>();

  function get(id: string): RatingRecord {
    return store.get(id) ?? { sum: 0, count: 0, views: 0 };
  }

  return {
    async getMany(ids) {
      const out: Record<string, RatingSummary> = {};
      ids.forEach((id) => {
        out[id] = summarize(store.get(id));
      });
      return out;
    },
    async submitRating(id, value) {
      const rec = get(id);
      rec.sum += value;
      rec.count += 1;
      store.set(id, rec);
      return summarize(rec);
    },
    async recordView(id) {
      const rec = get(id);
      rec.views += 1;
      store.set(id, rec);
    },
  };
}

let backend: Backend | null = null;
function getBackend(): Backend {
  if (backend) return backend;
  const hasRedis =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
  if (hasRedis) {
    backend = createRedisBackend();
  } else {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[ratings-store] UPSTASH_REDIS_REST_URL/TOKEN not set — using a " +
          "non-persistent in-memory store. Fine for local dev; set those " +
          "env vars before deploying (see lib/ratings-store.ts)."
      );
    }
    backend = createMemoryBackend();
  }
  return backend;
}

// ---------------------------------------------------------------------------
// Public API — every call site (lib/data.ts, the rate/view API routes) goes
// through these, never the backend directly.
// ---------------------------------------------------------------------------

export async function getRatingSummary(id: string): Promise<RatingSummary> {
  const many = await getBackend().getMany([id]);
  return many[id] ?? EMPTY;
}

export function getRatingSummaries(
  ids: string[]
): Promise<Record<string, RatingSummary>> {
  return getBackend().getMany(ids);
}

export function submitRating(id: string, value: number): Promise<RatingSummary> {
  return getBackend().submitRating(id, value);
}

export function recordView(id: string): Promise<void> {
  return getBackend().recordView(id);
}
