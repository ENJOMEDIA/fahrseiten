import { randomUUID } from "node:crypto";
import { z } from "zod";
const leadSchema = z.object({
  companyName: z.string().trim().min(2).max(180),
  contactName: z.string().trim().min(2).max(160),
  email: z.email(),
  phone: z.string().trim().max(40).optional(),
  websiteUrl: z.url().optional(),
  message: z.string().trim().min(5).max(3_000),
  privacyAccepted: z.literal(true),
  privacyTextVersion: z.string().trim().min(1).max(80),
  website: z.string().max(0),
  startedAt: z.number().int().positive(),
});
export type SalesLeadRecord = z.infer<typeof leadSchema> & {
  id: string;
  status: "new";
  source: "marketing_website";
  createdAt: Date;
};
export interface SalesLeadRepository {
  create(record: SalesLeadRecord): Promise<void>;
}
export async function submitSalesLead(
  raw: unknown,
  repository: SalesLeadRepository,
  now = Date.now(),
) {
  const input = leadSchema.parse(raw);
  if (now - input.startedAt < 2_000 || now - input.startedAt > 2 * 60 * 60_000)
    throw new Error("Die Anfrage konnte nicht geprüft werden.");
  const record: SalesLeadRecord = {
    ...input,
    id: randomUUID(),
    status: "new",
    source: "marketing_website",
    createdAt: new Date(now),
  };
  await repository.create(record);
  return { id: record.id, status: record.status };
}
