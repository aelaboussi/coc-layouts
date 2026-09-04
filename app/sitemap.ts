import type { MetadataRoute } from "next";
import { getAllLevels, getCatalogForLevel } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

// Next.js caps a single sitemap file at 50,000 URLs — we're well under
// that (~5,200), so one file is enough. If the catalog grows past that,
// switch to generateSitemaps() to split into multiple files.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  getAllLevels().forEach((l) => {
    if (l.count === 0) return;
    entries.push({
      url: `${base}/${l.hallType}/${l.level}`,
      changeFrequency: "daily",
      priority: 0.8,
    });
    // Raw catalog data, no live stats — a sitemap has no use for ratings,
    // and fetching them for every base would be a lot of wasted Redis calls.
    getCatalogForLevel(l.hallType, l.level).forEach((b) => {
      entries.push({
        url: `${base}/${b.hallType}/${b.level}/${b.slug}`,
        lastModified: b.addedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });
  });

  return entries;
}
