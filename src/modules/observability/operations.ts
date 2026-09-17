import "server-only";
import { count, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { backgroundJobs, errorReports, technicalEvents } from "@/db/schema";

export async function getOperationalSummary() {
  const [errors, failedJobs, events] = await Promise.all([
    db
      .select({ count: count() })
      .from(errorReports)
      .where(eq(errorReports.status, "new")),
    db
      .select({ count: count() })
      .from(backgroundJobs)
      .where(eq(backgroundJobs.status, "failed")),
    db
      .select({ count: count() })
      .from(technicalEvents)
      .where(isNull(technicalEvents.resolvedAt)),
  ]);
  return {
    newErrorReports: errors[0]?.count ?? 0,
    failedJobs: failedJobs[0]?.count ?? 0,
    unresolvedTechnicalEvents: events[0]?.count ?? 0,
  };
}
