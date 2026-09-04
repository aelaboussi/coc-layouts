import { NextRequest, NextResponse } from "next/server";
import { hasBase } from "@/lib/data";
import { submitRating } from "@/lib/ratings-store";

// One real vote per request — the client (components/RateWidget.tsx) blocks
// repeat submissions from the same browser via localStorage, which is a
// soft guard (not spoof-proof) appropriate for a low-stakes demo feature.
// Add real auth/rate-limiting before relying on this for anything that
// matters.
export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/bases/[id]/rate">
) {
  const { id } = await params;
  if (!hasBase(id)) {
    return NextResponse.json({ error: "Base not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const value = Number(body?.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return NextResponse.json(
      { error: "value must be an integer from 1 to 5" },
      { status: 400 }
    );
  }

  const summary = await submitRating(id, value);
  return NextResponse.json(summary);
}
