import { z } from "zod";
export const inquiryStatusSchema = z.enum([
  "new",
  "in_progress",
  "answered",
  "completed",
  "spam",
]);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
export interface InquiryManagementRepository {
  findStatus(
    tenantId: string,
    inquiryId: string,
  ): Promise<InquiryStatus | null>;
  updateStatus(
    tenantId: string,
    inquiryId: string,
    status: InquiryStatus,
    actorUserId: string,
  ): Promise<void>;
  addNote(
    tenantId: string,
    inquiryId: string,
    actorUserId: string,
    note: string,
  ): Promise<void>;
}
export async function changeInquiryStatus(args: {
  tenantId: string;
  inquiryId: string;
  status: unknown;
  actorUserId: string;
  repository: InquiryManagementRepository;
}) {
  const status = inquiryStatusSchema.parse(args.status);
  const current = await args.repository.findStatus(
    args.tenantId,
    args.inquiryId,
  );
  if (!current) throw new Error("Anfrage nicht gefunden.");
  if (current === status) return;
  await args.repository.updateStatus(
    args.tenantId,
    args.inquiryId,
    status,
    args.actorUserId,
  );
}
export async function addInquiryNote(args: {
  tenantId: string;
  inquiryId: string;
  actorUserId: string;
  note: unknown;
  repository: InquiryManagementRepository;
}) {
  const note = z.string().trim().min(1).max(5_000).parse(args.note);
  if (!(await args.repository.findStatus(args.tenantId, args.inquiryId)))
    throw new Error("Anfrage nicht gefunden.");
  await args.repository.addNote(
    args.tenantId,
    args.inquiryId,
    args.actorUserId,
    note,
  );
}
