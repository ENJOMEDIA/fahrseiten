import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { runNotificationScheduler } from "@/modules/notifications/runtime";
export async function POST(request: Request) {
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!env.CRON_SECRET || !safeEqual(provided, env.CRON_SECRET))
    return NextResponse.json({ ok: false }, { status: 401 });
  const result = await runNotificationScheduler();
  return NextResponse.json({ ok: true, ...result });
}
function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
