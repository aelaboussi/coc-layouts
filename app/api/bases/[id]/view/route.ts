import { NextRequest, NextResponse } from "next/server";
import { hasBase } from "@/lib/data";
import { recordView } from "@/lib/ratings-store";

// Fired once client-side when a detail page actually mounts in a browser
// (components/ViewTracker.tsx) — deliberately NOT incremented during server
// rendering, which would also count link-hover prefetches and crawler
// fetches as "views" and inflate the number into something not real.
export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/bases/[id]/view">
) {
  const { id } = await params;
  if (!hasBase(id)) {
    return NextResponse.json({ error: "Base not found" }, { status: 404 });
  }
  await recordView(id);
  return NextResponse.json({ ok: true });
}
