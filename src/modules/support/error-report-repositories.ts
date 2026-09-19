import "server-only";
import { db } from "@/db/client";
import { desc, eq, sql } from "drizzle-orm";
import { errorReports, tenants } from "@/db/schema";
import type {
  ErrorReportRecord,
  ErrorReportRepository,
} from "./error-report-service";

const state = globalThis as typeof globalThis & {
  demoErrorReports?: ErrorReportRecord[];
};
export const demoErrorReports = (state.demoErrorReports ??= []);

export const demoErrorReportRepository: ErrorReportRepository = {
  async create(record) {
    demoErrorReports.push(record);
  },
};

export const dbErrorReportRepository: ErrorReportRepository = {
  async create(record) {
    await db.insert(errorReports).values(record);
  },
};

export async function listRecentErrorReports(limit = 25) {
  return db
    .select({
      id: errorReports.id,
      referenceId: errorReports.referenceId,
      summary: errorReports.summary,
      description: errorReports.description,
      surface: errorReports.surface,
      status: errorReports.status,
      priority: errorReports.priority,
      tenantName: tenants.name,
      createdAt: errorReports.createdAt,
    })
    .from(errorReports)
    .leftJoin(tenants, eq(errorReports.tenantId, tenants.id))
    .orderBy(
      sql`case when ${errorReports.priority} = 'high' then 0 else 1 end`,
      desc(errorReports.createdAt),
    )
    .limit(limit);
}
