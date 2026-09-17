import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { env } from "@/config/env";
import { db } from "@/db/client";
import { technicalLog } from "@/modules/observability/logger";
import { localMonitoringAdapter } from "@/modules/observability/monitoring";

export async function GET() {
  try {
    const monitoring = await localMonitoringAdapter.check();
    if (env.DEMO_DATA_MODE === "database") await db.execute(sql`select 1`);
    return NextResponse.json(
      {
        status: "ready",
        checks: {
          application: "ok",
          database: env.DEMO_DATA_MODE === "database" ? "ok" : "fixture",
          monitoring: monitoring.status,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    const event = technicalLog("error", "readiness.failed");
    return NextResponse.json(
      { status: "not_ready", referenceId: event.referenceId },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
