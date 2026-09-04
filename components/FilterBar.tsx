"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BaseCategory, CATEGORY_LABELS, SORT_LABELS, SortOption } from "@/lib/types";

const CATEGORY_OPTIONS: (BaseCategory | "all")[] = [
  "all",
  "war",
  "farming",
  "trophy",
  "hybrid",
  "progress",
  "general",
  "fun",
];

export default function FilterBar({
  activeCategory,
  activeSort,
}: {
  activeCategory: string;
  activeSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Any filter change invalidates the current page number.
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => updateParam("category", cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {cat === "all" ? "All Bases" : CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-400">
        Sort by
        <select
          value={activeSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-200 focus:border-amber-500 focus:outline-none"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
