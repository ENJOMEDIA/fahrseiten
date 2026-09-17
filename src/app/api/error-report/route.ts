import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { technicalLog } from "@/modules/observability/logger";
import {
  dbErrorReportRepository,
  demoErrorReportRepository,
} from "@/modules/support/error-report-repositories";
import { submitErrorReport } from "@/modules/support/error-report-service";

export async function POST(request: Request) {
  try {
    const repository =
      env.DEMO_DATA_MODE === "fixture" && process.env.NODE_ENV !== "production"
        ? demoErrorReportRepository
        : dbErrorReportRepository;
    const result = await submitErrorReport(await request.json(), repository);
    technicalLog("info", "error_report.received", {
      referenceId: result.referenceId,
    });
    return NextResponse.json(result, { status: 201 });
  } catch {
    const event = technicalLog("warning", "error_report.rejected");
    return NextResponse.json(
      { referenceId: event.referenceId },
      { status: 422 },
    );
  }
}
