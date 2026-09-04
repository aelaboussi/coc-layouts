"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { siteConfig } from "@/lib/site-config";

const NAV = [
  { href: "/th/13", label: "Popular TH13" },
  { href: "/th/17", label: "Popular TH17" },
  { href: "/bh/10", label: "Builder Hall" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-slate-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-600 text-sm text-slate-950">
            CC
          </span>
          <span className="hidden sm:inline text-amber-400">
            {siteConfig.name}
          </span>
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar className="max-w-md" />
        </div>

        <nav className="ml-auto hidden items-center gap-5 text-sm text-slate-300 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-amber-400">
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 text-slate-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-800 px-4 py-3 md:hidden">
          <SearchBar className="mb-3" />
          <nav className="flex flex-col gap-3 text-sm text-slate-300">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="hover:text-amber-400">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
