import { NextResponse } from "next/server";
import { env } from "@/config/env";
import {
  dbConsentRepository,
  demoConsentRepository,
} from "@/modules/consent/repositories";
import { recordConsentEvidence } from "@/modules/consent/service";

export async function POST(request: Request) {
  try {
    const repository =
      env.DEMO_DATA_MODE === "fixture" && process.env.NODE_ENV !== "production"
        ? demoConsentRepository
        : dbConsentRepository;
    const host =
      request.headers.get("host")?.split(":")[0] ?? "unknown.invalid";
    await recordConsentEvidence(await request.json(), host, repository);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 422 });
  }
}
