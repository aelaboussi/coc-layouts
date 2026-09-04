"use client";

import { useEffect } from "react";

/** Fires once when a detail page actually mounts in a real browser, so the
 * view counter reflects genuine page loads rather than server-side
 * rendering (which would also fire on link-hover prefetches and crawlers). */
export default function ViewTracker({ baseId }: { baseId: string }) {
  useEffect(() => {
    fetch(`/api/bases/${baseId}/view`, { method: "POST", keepalive: true }).catch(() => {
      // Best-effort — a missed view count isn't worth surfacing an error.
    });
  }, [baseId]);

  return null;
}
