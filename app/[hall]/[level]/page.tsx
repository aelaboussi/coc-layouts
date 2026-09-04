import { Fragment } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllLevels,
  getBasesForLevel,
  isSupportedLevel,
  levelLabel,
} from "@/lib/data";
import { BaseCategory, HallType, SortOption } from "@/lib/types";
import BaseCard from "@/components/BaseCard";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import AdSlot from "@/components/AdSlot";

function parseHall(hall: string): HallType | null {
  return hall === "th" || hall === "bh" ? hall : null;
}

export function generateStaticParams() {
  return getAllLevels().map((l) => ({
    hall: l.hallType,
    level: String(l.level),
  }));
}

export async function generateMetadata(
  props: PageProps<"/[hall]/[level]">
): Promise<Metadata> {
  const { hall, level } = await props.params;
  const hallType = parseHall(hall);
  if (!hallType) return {};
  return { title: `${levelLabel(hallType, Number(level))} Base Layouts` };
}

export default async function LevelPage(props: PageProps<"/[hall]/[level]">) {
  const { hall, level } = await props.params;
  const searchParams = await props.searchParams;

  const hallType = parseHall(hall);
  const levelNum = Number(level);
  if (!hallType || Number.isNaN(levelNum) || !isSupportedLevel(hallType, levelNum)) {
    notFound();
  }

  const category = (
    typeof searchParams.category === "string" ? searchParams.category : "all"
  ) as BaseCategory | "all";
  const sort = (
    typeof searchParams.sort === "string" ? searchParams.sort : "newest"
  ) as SortOption;
  const pageParam = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await getBasesForLevel(hallType, levelNum, {
    category,
    sort,
    page: Number.isFinite(pageParam) ? pageParam : 1,
  });

  const usp = new URLSearchParams();
  if (category !== "all") usp.set("category", category);
  if (sort !== "newest") usp.set("sort", sort);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-amber-400">
          Home
        </Link>{" "}
        / {levelLabel(hallType, levelNum)}
      </nav>
      <h1 className="mb-6 text-2xl font-bold text-slate-100">
        {levelLabel(hallType, levelNum)} Base Layouts
        {result.total > 0 && (
          <span className="ml-2 text-base font-normal text-slate-500">
            ({result.total.toLocaleString()})
          </span>
        )}
      </h1>

      {result.total === 0 && category === "all" ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="text-sm text-slate-400">
            No layouts for {levelLabel(hallType, levelNum)} yet — this level
            isn&rsquo;t covered by the current open dataset.
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Check back soon, or see{" "}
            <Link href="/th/13" className="text-amber-400 hover:underline">
              Town Hall 13
            </Link>{" "}
            for a fully populated example.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <FilterBar activeCategory={category} activeSort={sort} />
          </div>

          {result.items.length === 0 ? (
            <p className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
              No bases match this filter. Try a different category.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {result.items.map((base, i) => (
                <Fragment key={base.id}>
                  <BaseCard base={base} />
                  {i === 7 && (
                    <div className="col-span-full">
                      <AdSlot size="inFeed" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          )}

          <Pagination
            pathname={`/${hallType}/${levelNum}`}
            searchParams={usp}
            page={result.page}
            totalPages={result.totalPages}
          />
        </>
      )}
    </div>
  );
}
