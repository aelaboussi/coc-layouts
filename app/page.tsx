import Link from "next/link";
import {
  getLevelPreviewImage,
  getLevels,
  getRecentlyAdded,
  getTotalBaseCount,
} from "@/lib/data";
import LevelGrid from "@/components/LevelGrid";
import BaseCard from "@/components/BaseCard";
import AdSlot from "@/components/AdSlot";

function previewMap(levels: { hallType: "th" | "bh"; level: number }[]) {
  return Object.fromEntries(
    levels.map((l) => [
      `${l.hallType}-${l.level}`,
      getLevelPreviewImage(l.hallType, l.level),
    ])
  );
}

export default async function Home() {
  const thLevels = getLevels("th");
  const bhLevels = getLevels("bh");
  const recentlyAdded = await getRecentlyAdded(8);
  const totalBases = getTotalBaseCount();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 px-6 py-12 text-center sm:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
          Best <span className="text-amber-400">Clash of Clans</span> Base
          Layouts
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
          Browse {totalBases.toLocaleString()}+ real war, farming, trophy and
          hybrid base layouts for Town Hall levels, sourced from the open
          community dataset and linking straight into the game.
        </p>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Town Hall Bases</h2>
        </div>
        <LevelGrid levels={thLevels} previewImages={previewMap(thLevels)} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">
            Builder Hall Bases
          </h2>
        </div>
        <LevelGrid levels={bhLevels} previewImages={previewMap(bhLevels)} />
      </section>

      <div className="my-10">
        <AdSlot size="inFeed" />
      </div>

      <section className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Recently Added</h2>
          <Link href="/th/17" className="text-xs text-amber-400 hover:underline">
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {recentlyAdded.map((base) => (
            <BaseCard key={base.id} base={base} />
          ))}
        </div>
      </section>
    </div>
  );
}
