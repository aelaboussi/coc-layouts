import Link from "next/link";
import WatermarkedImage from "./WatermarkedImage";
import { LevelSummary } from "@/lib/types";

function seedFromKey(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return h;
}

export default function LevelGrid({
  levels,
  previewImages,
}: {
  levels: LevelSummary[];
  /** Map of "th-13" -> real screenshot URL, from lib/data.ts's
   * getLevelPreviewImage(). Levels with no entry (Builder Hall, TH3 — the
   * open dataset doesn't cover them) get an honest "coming soon" tile
   * instead of a fake image. */
  previewImages: Record<string, string | undefined>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {levels.map((l) => {
        const key = `${l.hallType}-${l.level}`;
        const image = previewImages[key];
        return (
          <Link
            key={key}
            href={`/${l.hallType}/${l.level}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5"
          >
            <div className="relative aspect-square w-full">
              {image ? (
                <WatermarkedImage
                  src={image}
                  alt={`${l.label} example base`}
                  seed={seedFromKey(key)}
                  sizes="(max-width: 640px) 25vw, 16vw"
                  className="transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-800/60 to-slate-900 text-slate-600">
                  <span className="text-lg font-bold">
                    {l.hallType.toUpperCase()}
                    {l.level}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide">
                    Coming soon
                  </span>
                </div>
              )}
              <span className="absolute left-1.5 top-1.5 rounded bg-slate-950/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur">
                {l.hallType.toUpperCase()}
                {l.level}
              </span>
            </div>
            <div className="px-2 py-1.5 text-center text-[11px] text-slate-500">
              {l.count > 0 ? `${l.count.toLocaleString()} bases` : "No bases yet"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
