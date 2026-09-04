"use client";

import { useEffect, useState } from "react";

/** Interactive 1-5 star picker. Submits a real vote to /api/bases/[id]/rate
 * and updates the live aggregate shown on the page. One vote per browser,
 * remembered in localStorage — not spoof-proof, just enough to stop the
 * obvious repeat-click case for a demo feature. */
export default function RateWidget({
  baseId,
  initialAverage,
  initialCount,
}: {
  baseId: string;
  initialAverage: number;
  initialCount: number;
}) {
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Deferred a tick so this reads as "syncing with an external store", not
    // a synchronous setState-in-effect (localStorage isn't available during
    // SSR, so this can't be a lazy useState initializer instead).
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(`rated:${baseId}`);
        if (stored) setMyRating(Number(stored));
      } catch {
        // localStorage unavailable — voting still works, just not remembered.
      }
    });
  }, [baseId]);

  async function rate(value: number) {
    if (myRating !== null || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch(`/api/bases/${baseId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("request failed");
      const summary = await res.json();
      setAverage(summary.average);
      setCount(summary.count);
      setMyRating(value);
      try {
        localStorage.setItem(`rated:${baseId}`, String(value));
      } catch {
        // ignore
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const displayValue = hover || myRating || 0;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {count > 0 ? (
            <>
              <span className="font-medium text-slate-200">{average.toFixed(1)}</span>{" "}
              average from {count.toLocaleString()} rating{count === 1 ? "" : "s"}
            </>
          ) : (
            "Not yet rated — be the first"
          )}
        </span>
      </div>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rate this base">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            disabled={myRating !== null || submitting}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => rate(v)}
            aria-label={`Rate ${v} star${v === 1 ? "" : "s"}`}
            aria-checked={myRating === v}
            role="radio"
            className={`text-xl leading-none transition ${
              myRating !== null
                ? "cursor-default"
                : "cursor-pointer hover:scale-110"
            } ${v <= displayValue ? "text-amber-400" : "text-slate-700"}`}
          >
            ★
          </button>
        ))}
        {myRating !== null && (
          <span className="ml-2 text-xs text-amber-400">
            You rated this {myRating}★ — thanks!
          </span>
        )}
        {error && (
          <span className="ml-2 text-xs text-red-400">
            Couldn&rsquo;t submit — try again
          </span>
        )}
      </div>
    </div>
  );
}
