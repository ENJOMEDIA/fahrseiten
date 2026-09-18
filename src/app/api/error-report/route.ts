import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { AuthRateLimiter } from "@/modules/auth/rate-limit";
import { technicalLog } from "@/modules/observability/logger";
import {
  dbErrorReportRepository,
  demoErrorReportRepository,
} from "@/modules/support/error-report-repositories";
import { submitErrorReport } from "@/modules/support/error-report-service";
import { getSessionIdentity } from "@/modules/auth/session";
import { isTrustedMutationRequest } from "@/modules/security/origin";

const limiter = new AuthRateLimiter(10, 15 * 60_000, 15 * 60_000);

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const key = limiter.key(
    "error-report",
    request.headers.get("user-agent") ?? "unknown",
  );
  if (!limiter.isAllowed(key)) return new NextResponse(null, { status: 429 });
  try {
    const repository =
      env.DEMO_DATA_MODE === "fixture" && process.env.NODE_ENV !== "production"
        ? demoErrorReportRepository
        : dbErrorReportRepository;
    const identity = await getSessionIdentity();
    const result = await submitErrorReport(await request.json(), repository, {
      reporterUserId: identity?.id,
      tenantId: identity?.memberships[0]?.tenantId,
    });
    technicalLog("info", "error_report.received", {
      referenceId: result.referenceId,
    });
    return NextResponse.json(result, { status: 201 });
  } catch {
    limiter.recordFailure(key);
    const event = technicalLog("warning", "error_report.rejected");
    return NextResponse.json(
      { referenceId: event.referenceId },
      { status: 422 },
    );
  }
}
