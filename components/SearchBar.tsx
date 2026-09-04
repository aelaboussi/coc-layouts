"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  hallType: "th" | "bh";
  level: number;
  slug: string;
}

export default function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced fetch against /api/search — keeps the full dataset (and its
  // node:fs-backed ratings store) out of the client bundle entirely.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: SearchResult[]) => setResults(data))
        .catch(() => {
          // Aborted or network error — leave previous results in place.
        });
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) {
            router.push(`/${results[0].hallType}/${results[0].level}/${results[0].slug}`);
            setOpen(false);
          }
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            if (!value.trim()) setResults([]);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search bases, e.g. TH14 war base..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </form>
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/${r.hallType}/${r.level}/${r.slug}`}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-800 px-4 py-2 text-sm text-slate-200 last:border-none hover:bg-slate-800"
            >
              {r.title}
            </Link>
          ))}
        </div>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-500 shadow-xl">
          No bases found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
