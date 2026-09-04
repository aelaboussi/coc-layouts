# ClashLayouts (redesign)

A responsive, modern rebuild of a Clash of Clans base-layout browser, backed
by **real content**: 5,162 real base layouts (Town Hall 4–18) from the
open-source (MIT) [nschmeller/clash-bases](https://github.com/nschmeller/clash-bases)
dataset — real in-game share links, real screenshots, real attribution. See
`ATTRIBUTION.md`.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- `next/image` for lazy-loaded, optimized, watermarked base screenshots
- No database to provision — content is a bundled JSON file loaded once into
  memory (see "Content" below); ratings/views live in Upstash Redis, a
  free HTTP-based key-value store rather than a server you run (see
  "Ratings & views"). Swap either for a real DB/CMS later without touching
  pages.

## Getting started

```bash
npm install
cp .env.example .env.local   # set your real domain once you have one
npm run dev
```

Visit `http://localhost:3000`.

```bash
npm run build && npm run start   # production build
```

## Project structure

- `app/page.tsx` — homepage (TH/BH level grids + recently added)
- `app/[hall]/[level]/page.tsx` — listing page per level: category filter,
  sort, and real pagination (`?category=war&sort=az&page=3`)
- `app/[hall]/[level]/[slug]/page.tsx` — base detail page
- `app/sitemap.ts`, `app/robots.ts` — generated from the real catalog
- `components/` — Header, Footer, SearchBar, BaseCard, FilterBar,
  Pagination, WatermarkedImage, LevelGrid (real-image homepage cards),
  RatingStars, RateWidget (interactive voting), ViewTracker, CopyLinkButton,
  BaseThumb (fallback placeholder art), AdSlot
- `app/api/bases/[id]/rate`, `app/api/bases/[id]/view` — real, user-driven
  rating/view endpoints (see "Ratings & views" below)
- `app/api/search` — the only bridge the client-side search bar has into the
  server-only data layer (see "Performance notes")
- `lib/data.ts` — the entire content layer, built once at module load into
  `Map`s for O(1) lookups (by slug, by level). Every page calls through the
  exported functions (`getLevels`, `getBasesForLevel`, `getBaseBySlug`,
  `searchBases`, ...) — point this file at a real database/CMS/API later and
  nothing else in the app changes.
- `lib/ratings-store.ts` — real rating/view persistence (see below)
- `lib/site-config.ts` — the few things you'll change once you own a domain
  (site name, URL, image watermark text) — editable in code or via env vars
- `data/coc-bases-source.json` — the bundled open dataset (3MB, 5,162
  entries)

## Content

`lib/data.ts` loads `data/coc-bases-source.json` at build/start time,
normalizes it into the app's `BaseLayout` shape, and indexes it into `Map`s
so every lookup (by slug, by level, filtered/sorted/paginated) is O(1)–O(n)
over an in-memory array — no network or DB round trip per request.

Coverage is Town Hall 4–18 only (the open dataset doesn't include Town Hall
3 or any Builder Hall level). The site's nav still lists TH3 and BH3–BH10 —
matching the original product's scope — but shows an honest "no layouts yet"
empty state there instead of fake content. Wire up a second source through
the same `lib/data.ts` functions to fill those in.

Each base's real fields: title, category (mapped from the dataset's
War/Farm/Trophy/Hybrid/Progress/Fun/Home Village types), a real
`link.clashofclans.com` deep link that opens the layout directly in-game,
a real screenshot, tags, date added, and attribution back to whoever
originally curated it (linked to GitHub when the attribution is a
`user/repo`). The homepage's Town Hall level cards use a real screenshot
from that level too (`getLevelPreviewImage`), not a text badge.

## Ratings & views

The open dataset has no rating/view-count data, so rather than faking
numbers, the app has a small **real** rating/view system:

- `components/RateWidget.tsx` (client) lets a visitor cast one 1–5 star vote
  per base, POSTed to `app/api/bases/[id]/rate/route.ts`. One vote per
  browser (remembered in `localStorage`) — not spoof-proof, just enough to
  stop the obvious repeat-click case for a demo feature.
- `components/ViewTracker.tsx` fires once when a detail page actually mounts
  client-side, POSTing to `app/api/bases/[id]/view/route.ts`. It's
  deliberately client-side, not counted during server rendering — otherwise
  link-hover prefetches and crawler fetches would inflate the number into
  something not real.
- `lib/ratings-store.ts` persists both to **Upstash Redis**, over its
  HTTP/REST API. New bases start at "Not yet rated" / 0 views and only
  grow from genuine interaction.
- Listing pages can sort by the real result: `?sort=rating` and
  `?sort=views` join live in `lib/data.ts`'s `getBasesForLevel` (unrated
  bases sink below rated ones rather than tying at the top).

### Why Upstash Redis, and how to set it up

Vercel and Netlify run your app as short-lived serverless functions with no
writable, persistent filesystem — a JSON file on disk (or a `Map` kept in
memory at the module level) gets wiped or forked between invocations, so
ratings would silently reset or diverge. Upstash Redis solves that without
asking you to provision or manage a traditional database server: it's
accessed over plain HTTPS (`@upstash/redis`'s `Redis.fromEnv()`), so a
serverless function just makes an HTTP call, the same as it would to any
other API. The free tier is generous enough for a small-to-medium site.

Setup:

1. Create a free database at [upstash.com](https://upstash.com) (or, on
   Vercel, add the Upstash integration from your project's Storage tab,
   which injects the env vars for you automatically).
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — in
   `.env.local` for local dev, and in your host's environment variable
   settings for Vercel/Netlify/etc. See `.env.example`.

Local dev with neither var set: `lib/ratings-store.ts` falls back to a
plain in-memory `Map`, so `npm run dev` works with zero setup (a
`console.warn` says so on server start). That fallback resets on every
restart and isn't shared across instances — it exists purely so you're not
forced to create an Upstash account before you can look at the site.

One quirk of that fallback specifically, confirmed while testing this: hit
`/api/bases/[id]/rate` or `/view` repeatedly against a `next start` build
with no Redis creds and the *route handler's* count keeps climbing
correctly call-to-call, but a detail page loaded right after can still
show "Not yet rated" / 0 views. That's Next's production runtime compiling
page renders and route handlers into separate module graphs (see the
historical note below) — with the in-memory `Map`, each graph gets its own
copy, so the two don't see each other's writes. It only affects the
credential-less local fallback; set real `UPSTASH_REDIS_REST_URL`/`TOKEN`
(free tier is fine) and it goes away, because Redis lives outside any
module graph and every instance talks to the same store over HTTP. If you
want to see ratings/views fully wired end-to-end locally, point `.env.local`
at a real (even free) Upstash database rather than relying on this
fallback.

Every read/write in the app goes through `lib/ratings-store.ts`'s exported
functions (`getRatingSummary`, `getRatingSummaries`, `submitRating`,
`recordView`) behind a small `Backend` interface, so the Redis and
in-memory implementations are interchangeable and the rest of the app
never knows which one is active. `lib/data.ts` merges live stats into the
static catalog at read time, which is why most of its exports are `async`.

Historical note, worth knowing if you extend this: an earlier,
file-backed version of this store hit a real bug where Next's production
runtime (Turbopack) compiles each route into its own isolated module
graph, so a route handler and a page render could end up with *separate
instances* of an imported module — a module-level in-memory cache went
stale (writes from the API route never appeared on the page). The current
Redis-backed store doesn't have this problem since Redis itself is the
single source of truth and there's no local cache to go stale.

## Images: lazy loading, optimization, watermark

`components/WatermarkedImage.tsx` wraps every real screenshot:

- **Lazy loading** via `next/image` (`loading="lazy"` off-screen, `priority`
  only on the detail page's hero image, which is the actual LCP element)
- **Optimization**: Next resizes/re-encodes to AVIF/WebP through
  `/_next/image` on demand — configure allowed source hosts in
  `next.config.ts` (`images.remotePatterns`; currently the 7 hosts the
  bundled dataset actually points to)
- **Skeleton shimmer** while an image loads, sized to the real aspect ratio
  (no layout shift)
- **Graceful fallback**: if a third-party image 404s (expected over time —
  images are hotlinked from several external sites), it swaps to the
  generated placeholder art instead of a broken-image icon
- **Watermark**: a small text overlay in the bottom-right corner of every
  image, driven by `NEXT_PUBLIC_IMAGE_WATERMARK` in `.env.local` (falls back
  to a value in `lib/site-config.ts`). It's a lightweight CSS overlay, not
  server-side image processing — zero extra latency, works with lazy
  loading, and is a one-line env var change once you have a real domain.

> Heads up: this sandbox's outbound network only allows a small domain
> allowlist, so the actual third-party image hosts (basemelon.com,
> oneclash.com, etc.) aren't reachable from *here* — you'll see the
> generated fallback art in any screenshot I took. That's a constraint of
> this environment, not the app: run it locally or deploy it and the real
> screenshots will load normally (I confirmed the URLs, `next/image` config,
> and optimizer wiring are all correct — only the network path from this
> sandbox is restricted).

## Ads

`components/AdSlot.tsx` renders labeled placeholder boxes at the sizes ads
will actually need (leaderboard, medium rectangle, skyscraper, in-feed,
mobile banner) in every position a real placement would go: below the
header, in-feed on listing/home grids, and beside + inside the detail page.

To turn on Google AdSense later:

1. Add the AdSense script tag to `app/layout.tsx`.
2. Inside `AdSlot`, replace the placeholder `<div>` with your
   `<ins class="adsbygoogle">` unit, keyed off the `size` prop.
3. Nothing else changes — every page already has slots reserved.

## Performance notes

- Listing pages paginate at 24 bases/page (some levels have 500+ real
  entries — TH17 alone has 535) instead of rendering huge grids.
- Detail and listing pages render on demand (no `generateStaticParams` for
  ~5,200 detail routes) since data access is an in-memory lookup, not a DB
  call — this keeps the production build under 10s instead of pre-rendering
  thousands of pages. Add `export const revalidate = 3600` on either page if
  you deploy somewhere with an ISR cache and want popular pages to warm up.
- No route-level `loading.tsx` on the dynamic routes: Next.js's streaming
  Suspense boundary (which `loading.tsx` creates) locks the HTTP response to
  `200` before a `notFound()` check can resolve, which would have turned
  broken/old links into soft-404s instead of real ones. Since renders here
  are sub-millisecond in-memory lookups anyway (nothing to mask with a
  skeleton), dropping it costs no perceived performance and keeps real 404s
  for bad slugs/levels — verified in testing.
- Search (`components/SearchBar.tsx`) is a Client Component, so it never
  imports `lib/data.ts` directly — that would bundle the entire ~5,200-entry
  dataset into client-side JS. It debounces (150ms) against
  `app/api/search/route.ts` instead, which matches against a precomputed
  lowercase index built once at server module load, and deliberately skips
  merging in live rating/view stats (the search dropdown never shows them),
  so it costs no Redis round trip per keystroke. Check
  `.next/static/chunks/*.js` sizes after a build if you add new client
  components that import server data — nothing should approach the size of
  the dataset itself.

## Responsive design

Mobile-first breakpoints throughout (`sm`, `md`, `lg` Tailwind breakpoints):
single-column stacking on mobile, 2–3 column grids on tablet, up to 6-column
level grids / 4-column card grids on desktop. Sticky header collapses to a
hamburger + inline search below `md`.
