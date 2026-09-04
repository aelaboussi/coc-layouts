import { NextRequest, NextResponse } from "next/server";
import { searchBases } from "@/lib/data";

// Keeps the ~5,200-entry dataset strictly server-side.
// components/SearchBar.tsx is a Client Component and must not import
// lib/data.ts directly — that would bundle the entire catalog into
// client-side JS. This route is the only bridge.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = searchBases(q, 8).map((b) => ({
    id: b.id,
    title: b.title,
    hallType: b.hallType,
    level: b.level,
    slug: b.slug,
  }));
  return NextResponse.json(results);
}
