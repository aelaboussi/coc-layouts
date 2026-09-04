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
};
