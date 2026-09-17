import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { status: "ready", checks: { application: "ok" } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
