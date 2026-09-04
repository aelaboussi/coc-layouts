const SIZES = {
  banner: { w: "100%", h: "90px", label: "728 × 90 Leaderboard" },
  rectangle: { w: "100%", h: "250px", label: "300 × 250 Medium Rectangle" },
  mobileBanner: { w: "100%", h: "50px", label: "320 × 50 Mobile Banner" },
  inFeed: { w: "100%", h: "120px", label: "In-feed Native Ad" },
  skyscraper: { w: "100%", h: "600px", label: "160 × 600 Skyscraper" },
} as const;

export type AdSlotSize = keyof typeof SIZES;

/**
 * Reserved ad placement. Purely a visual placeholder today — swap the inner
 * div for your <ins class="adsbygoogle" ...> unit (or any other network)
 * once you're ready to turn ads on. Keeping slots as their own component
 * means that's a one-file change everywhere on the site.
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
