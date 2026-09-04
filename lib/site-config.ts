/**
 * Central place for anything you'll want to change once you own a domain.
 * Everything here can also be overridden per-environment via env vars
 * (e.g. in Vercel project settings) without touching code.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "ClashLayouts",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  /**
   * Text stamped onto every base preview image (see components/Watermark.tsx).
   * Change this the moment you have a real domain — it's read at request
   * time, so it's a one-line edit in .env (or here), no rebuild logic to
   * hunt down.
   */
  imageWatermarkText:
    process.env.NEXT_PUBLIC_IMAGE_WATERMARK ?? "ClashLayouts.com — demo build",
  /**
   * Google AdSense publisher ID (the "ca-pub-..." value from your AdSense
   * verification snippet). Undefined until you set it — the loader script
   * (app/layout.tsx) and ads.txt (app/ads.txt/route.ts) both no-op without
   * it, so it's safe to leave unset in local dev and on any environment
   * before you're approved.
   */
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || undefined,
  /**
   * Per-placement ad unit ("slot") IDs — created one at a time on the Ads
   * page of your AdSense account, after your site is approved. Each is
   * undefined until you set its env var, and components/AdSlot.tsx falls
   * back to the visual placeholder for any slot that isn't set yet, so you
   * can turn placements on individually as you create each ad unit.
   */
  adsenseSlots: {
    banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || undefined,
    rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE || undefined,
    mobileBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_BANNER || undefined,
    inFeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED || undefined,
    skyscraper: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SKYSCRAPER || undefined,
  },
};
