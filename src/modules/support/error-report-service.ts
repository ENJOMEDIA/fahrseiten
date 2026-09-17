import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createReferenceId } from "@/modules/observability/logger";

const reportSchema = z.object({
  referenceId: z.string().trim().max(40).optional(),
  summary: z.string().trim().min(5).max(180),
  description: z.string().trim().min(10).max(5_000),
  surface: z.enum(["marketing", "customer_backend"]),
  website: z.string().max(0),
});

export type ErrorReportRecord = {
  id: string;
  referenceId: string;
  summary: string;
  description: string;
  surface: "marketing" | "customer_backend";
  status: "new";
  createdAt: Date;
};

export interface ErrorReportRepository {
  create(record: ErrorReportRecord): Promise<void>;
}

export async function submitErrorReport(
  raw: unknown,
  repository: ErrorReportRepository,
) {
  const input = reportSchema.parse(raw);
  const record: ErrorReportRecord = {
    id: randomUUID(),
    referenceId: input.referenceId || createReferenceId(),
    summary: input.summary,
    description: input.description,
    surface: input.surface,
    status: "new",
    createdAt: new Date(),
  };
  await repository.create(record);
  return { referenceId: record.referenceId };
}
