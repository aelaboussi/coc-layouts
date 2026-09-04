import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getBaseBySlug,
  getRelatedBases,
  isSupportedLevel,
  levelLabel,
} from "@/lib/data";
import { CATEGORY_LABELS, HallType } from "@/lib/types";
import WatermarkedImage from "@/components/WatermarkedImage";
import CopyLinkButton from "@/components/CopyLinkButton";
import BaseCard from "@/components/BaseCard";
import AdSlot from "@/components/AdSlot";
import RateWidget from "@/components/RateWidget";
import ViewTracker from "@/components/ViewTracker";

// 5,000+ real entries — rendered on demand (in-memory lookup, no DB call,
// so this is still sub-millisecond) rather than pre-built at compile time.
// Add `export const revalidate = 3600` if you deploy somewhere with an ISR
// cache and want popular pages to warm up automatically.
export const dynamicParams = true;

function parseHall(hall: string): HallType | null {
  return hall === "th" || hall === "bh" ? hall : null;
}

function seedFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

export async function generateMetadata(
  props: PageProps<"/[hall]/[level]/[slug]">
): Promise<Metadata> {
  const { hall, level, slug } = await props.params;
  const hallType = parseHall(hall);
  if (!hallType) return {};
  const base = await getBaseBySlug(hallType, Number(level), slug);
  if (!base) return {};
  return {
    title: base.title,
    description: base.description || base.title,
    openGraph: { images: [base.image] },
  };
}

export default async function BaseDetailPage(
  props: PageProps<"/[hall]/[level]/[slug]">
) {
  const { hall, level, slug } = await props.params;
  const hallType = parseHall(hall);
  const levelNum = Number(level);
  if (!hallType || Number.isNaN(levelNum) || !isSupportedLevel(hallType, levelNum)) {
    notFound();
  }

  const base = await getBaseBySlug(hallType, levelNum, slug);
  if (!base) notFound();

  const related = await getRelatedBases(base, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-amber-400">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/${hallType}/${levelNum}`} className="hover:text-amber-400">
          {levelLabel(hallType, levelNum)}
        </Link>{" "}
        / <span className="text-slate-400">{base.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="grid gap-6 sm:grid-cols-[320px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-800">
              <WatermarkedImage
                src={base.image}
                alt={base.title}
                seed={seedFromId(base.id)}
                sizes="320px"
                priority
              />
            </div>
            <div className="flex flex-col gap-3">
              <span className="w-fit rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                {CATEGORY_LABELS[base.category]}
              </span>
              <h1 className="text-2xl font-bold text-slate-100">
                {base.title}
              </h1>
              <RateWidget
                baseId={base.id}
                initialAverage={base.rating}
                initialCount={base.ratingCount}
              />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-3">
                <div>
                  <dt className="text-slate-600">Level</dt>
                  <dd className="text-slate-300">
                    {levelLabel(hallType, levelNum)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-600">Views</dt>
                  <dd className="text-slate-300">{base.views.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-slate-600">Added</dt>
                  <dd className="text-slate-300">
                    {new Date(base.addedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-600">Source</dt>
                  <dd className="text-slate-300">
                    {base.builderRepo ? (
                      <a
                        href={`https://github.com/${base.builderRepo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-amber-400 hover:underline"
                      >
                        {base.builderRepo}
                      </a>
                    ) : (
                      base.builder
                    )}
                  </dd>
                </div>
              </dl>
              <CopyLinkButton link={base.link} />
            </div>
          </div>
          <ViewTracker baseId={base.id} />

          {base.description && (
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-slate-200">
                About this base
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                {base.description}
              </p>
            </div>
          )}

          {base.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {base.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-800 px-2.5 py-1 text-[11px] text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <AdSlot size="rectangle" />
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-slate-100">
                More {levelLabel(hallType, levelNum)} Bases
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {related.map((b) => (
                  <BaseCard key={b.id} base={b} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <AdSlot size="skyscraper" />
          </div>
        </aside>
      </div>
    </div>
  );
}
