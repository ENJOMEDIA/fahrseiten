import "server-only";
import { db } from "@/db/client";
import { errorReports } from "@/db/schema";
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
