import type { NextConfig } from "next";

// Hosts the open-source dataset's `image` field actually points to
// (checked against the full 5,162-entry dataset — see data/coc-bases-source.json).
const IMAGE_HOSTS = [
  "media.oneclash.com",
  "img.basemelon.com",
  "raw.githubusercontent.com",
  "bases-coc.com",
  "blueprintcoc.com",
  "i.imgur.com",
  "cdn.shopify.com",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
