/** Read-only star display driven by real, live aggregate data — see
 * lib/ratings-store.ts. Shows an honest "Not yet rated" state at 0 votes
 * instead of a fabricated score. */
export default function RatingStars({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count: number;
  size?: "sm" | "md";
}) {
  if (count === 0) {
    return (
      <span className={`text-slate-600 ${size === "md" ? "text-sm" : "text-xs"}`}>
        Not yet rated
      </span>
    );
  }

  const full = Math.round(rating);
  const starSize = size === "md" ? "text-base" : "text-xs";
  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex ${starSize} text-amber-400`} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < full ? "opacity-100" : "opacity-25"}>
            ★
          </span>
        ))}
      </div>
      <span className="text-xs font-medium text-slate-300">
        {rating.toFixed(1)}
      </span>
      <span className="text-xs text-slate-500">({count.toLocaleString()})</span>
    </div>
  );
}
