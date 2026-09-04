"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/site-config";

const SIZES = {
  banner: { w: "100%", h: "90px", label: "728 × 90 Leaderboard" },
  rectangle: { w: "100%", h: "250px", label: "300 × 250 Medium Rectangle" },
  mobileBanner: { w: "100%", h: "50px", label: "320 × 50 Mobile Banner" },
  inFeed: { w: "100%", h: "120px", label: "In-feed Native Ad" },
  skyscraper: { w: "100%", h: "600px", label: "160 × 600 Skyscraper" },
} as const;

export type AdSlotSize = keyof typeof SIZES;

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

/**
 * Reserved ad placement. Renders a real AdSense unit once both
 * `siteConfig.adsenseClientId` (the loader script in app/layout.tsx) and
 * this size's slot ID (lib/site-config.ts's `adsenseSlots`) are set — until
 * then it falls back to a visual placeholder, so placements can be turned
 * on individually as you create each ad unit in your AdSense account,
 * rather than all-or-nothing.
 */
export default function AdSlot({
  size = "rectangle",
  className = "",
  label,
}: {
  size?: AdSlotSize;
  className?: string;
  label?: string;
}) {
  const spec = SIZES[size];
  const slotId = siteConfig.adsenseSlots[size];
  const live = Boolean(siteConfig.adsenseClientId && slotId);
  const pushed = useRef(false);

  useEffect(() => {
    if (!live || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded yet (blocked, ad blocker, or still
      // fetching) — nothing to recover from client-side, the <ins> just
      // stays empty.
    }
  }, [live]);

  if (live) {
    return (
      <ins
        className={`adsbygoogle block ${className}`}
        style={{ display: "block", minHeight: spec.h }}
        data-ad-client={siteConfig.adsenseClientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  return (
    <div
      data-ad-slot={size}
      className={`flex w-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 text-[11px] uppercase tracking-wide text-slate-500 ${className}`}
      style={{ minHeight: spec.h }}
      aria-hidden="true"
    >
      Ad space — {label ?? spec.label}
    </div>
  );
}
