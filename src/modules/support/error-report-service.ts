import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createReferenceId } from "@/modules/observability/logger";

const reportSchema = z.object({
  referenceId: z.string().trim().max(40).optional(),
  summary: z.string().trim().min(5).max(180),
  description: z.string().trim().min(10).max(5_000),
  surface: z.enum(["marketing", "customer_backend"]),
  website: z.string().max(0),
  pagePath: z.string().trim().max(500).optional(),
  browser: z.string().trim().max(500).optional(),
});

export type ErrorReportRecord = {
  id: string;
  referenceId: string;
  summary: string;
  description: string;
  surface: "marketing" | "customer_backend";
  status: "new";
  priority: "normal" | "high";
  tenantId?: string | null;
  reporterUserId?: string | null;
  createdAt: Date;
};

export interface ErrorReportRepository {
  create(record: ErrorReportRecord): Promise<void>;
}

export async function submitErrorReport(
  raw: unknown,
  repository: ErrorReportRepository,
  context: {
    tenantId?: string | null;
    reporterUserId?: string | null;
    priority?: "normal" | "high";
  } = {},
) {
  const input = reportSchema.parse(raw);
  const record: ErrorReportRecord = {
    id: randomUUID(),
    referenceId: input.referenceId || createReferenceId(),
    summary: input.summary,
    description: [
      input.description,
      input.pagePath ? `Seite: ${input.pagePath}` : "",
      input.browser ? `Browser: ${input.browser}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    surface: input.surface,
    status: "new",
    priority: context.priority ?? "normal",
    tenantId: context.tenantId,
    reporterUserId: context.reporterUserId,
    createdAt: new Date(),
  };
  await repository.create(record);
  return { referenceId: record.referenceId };
}
