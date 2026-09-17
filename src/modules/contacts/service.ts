import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { NotificationPort } from "@/modules/notifications/port";

export const inquiryInputSchema = z.object({
  formId: z.string().min(1),
  contactName: z.string().trim().min(1).max(160),
  email: z.email(),
  phone: z.string().trim().max(40).optional(),
  licenseInterest: z.string().trim().max(100).optional(),
  message: z.string().trim().min(5).max(5_000),
  privacyTextVersion: z.string().min(1).max(80),
  consent: z.literal(true),
  website: z.string().max(0),
  startedAt: z.number().int().positive(),
  source: z.string().max(100).default("public_website"),
});
export type InquiryInput = z.infer<typeof inquiryInputSchema>;
export type InquiryRecord = InquiryInput & {
  id: string;
  tenantId: string;
  status: "new";
  createdAt: Date;
};
export interface InquiryRepository {
  create(record: InquiryRecord): Promise<void>;
  markNotificationQueued(tenantId: string, inquiryId: string): Promise<boolean>;
}
export interface InquiryRateLimiter {
  allow(key: string): Promise<boolean>;
}

export async function submitInquiry(args: {
  tenantId: string;
  rawInput: unknown;
  fingerprint: string;
  now?: number;
  repository: InquiryRepository;
  notifications: NotificationPort;
  rateLimiter: InquiryRateLimiter;
}) {
  const now = args.now ?? Date.now();
  const input = inquiryInputSchema.parse(args.rawInput);
  const elapsed = now - input.startedAt;
  if (elapsed < 2_000 || elapsed > 2 * 60 * 60_000)
    throw new Error("Die Anfrage konnte nicht geprüft werden.");
  if (!(await args.rateLimiter.allow(`${args.tenantId}:${args.fingerprint}`)))
    throw new Error("Bitte versuche es später erneut.");
  const inquiry: InquiryRecord = {
    ...input,
    id: randomUUID(),
    tenantId: args.tenantId,
    status: "new",
    createdAt: new Date(now),
  };
  await args.repository.create(inquiry);
  if (await args.repository.markNotificationQueued(args.tenantId, inquiry.id)) {
    await args.notifications.enqueue({
      idempotencyKey: `contact:${inquiry.id}`,
      tenantId: args.tenantId,
      template: "contact_inquiry_received",
      entityId: inquiry.id,
    });
  }
  return { id: inquiry.id, status: inquiry.status };
}
