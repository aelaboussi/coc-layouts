"use client";

import { useState } from "react";

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (older browser / no permission) — the
      // "Open in Clash of Clans" link next to this still works either way.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        Open in Clash of Clans
      </a>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-amber-500/60 hover:text-amber-400"
      >
        {copied ? "Link copied!" : "Copy link"}
      </button>
    </div>
  );
}
