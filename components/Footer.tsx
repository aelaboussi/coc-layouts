import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const LANGUAGES = [
  "English",
  "Русский",
  "Deutsch",
  "Français",
  "Español",
  "Italiano",
  "Português",
  "Polski",
  "中文简体",
  "العربية",
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-2 font-bold text-amber-400">
              {siteConfig.name}
            </div>
            <p className="text-sm text-slate-500">
              Community base layout browser for Town Hall, sortable by
              category and freshness, linking directly into the game.
            </p>
          </div>
          <div className="text-sm">
            <div className="mb-2 font-semibold text-slate-200">Site</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/" className="hover:text-amber-400">Home</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="mb-2 font-semibold text-slate-200">Language</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500">
              {LANGUAGES.map((l) => (
                <span key={l} className="cursor-default hover:text-slate-300">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-600">
          <p>
            This is an unofficial fan-made resource and is not affiliated
            with or endorsed by Supercell. See Supercell&rsquo;s Fan Content
            Policy at supercell.com/en/fan-content-policy.
          </p>
          <p className="mt-2">
            Base layout data sourced from the open-source{" "}
            <a
              href="https://github.com/nschmeller/clash-bases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 hover:underline"
            >
              nschmeller/clash-bases
            </a>{" "}
            project (MIT License), with attribution to individual layout
            builders preserved on each base page.
          </p>
        </div>
      </div>
    </footer>
  );
}
