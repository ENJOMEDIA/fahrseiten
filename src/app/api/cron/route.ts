import { NextResponse } from "next/server";
import { env } from "@/config/env";
import {
  hasValidCronBearer,
  hasValidCronUrlToken,
} from "@/modules/jobs/cron-auth";
import { runNotificationScheduler } from "@/modules/notifications/runtime";

async function runScheduler() {
  const result = await runNotificationScheduler();
  return NextResponse.json(
    { ok: true, ...result },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  if (!hasValidCronBearer(request, env.CRON_SECRET))
    return NextResponse.json({ ok: false }, { status: 401 });
  return runScheduler();
}

export async function GET(request: Request) {
  if (!env.CRON_TRIGGER_TOKEN)
    return NextResponse.json({ ok: false }, { status: 503 });
  if (!hasValidCronUrlToken(request, env.CRON_TRIGGER_TOKEN))
    return NextResponse.json({ ok: false }, { status: 401 });
  return runScheduler();
}
