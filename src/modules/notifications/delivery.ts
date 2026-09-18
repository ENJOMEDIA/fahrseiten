import { createHash } from "node:crypto";
import { z } from "zod";
import type { JobRecord } from "@/modules/jobs/runner";
import type { MailTransport } from "./mail-transport";
import { renderEmailTemplate, type DeliveryTemplateKey } from "./templates";

const payloadSchema = z.object({
  to: z.email(),
  from: z.string().min(3),
  template: z.enum([
    "contact_inquiry_received",
    "password_reset",
    "user_invitation",
    "instance_invitation",
    "follow_up_due",
    "sales_outreach",
  ]),
  values: z.record(z.string(), z.unknown()),
});
export interface DeliveryRepository {
  reserve(input: {
    jobId: string;
    tenantId: string | null;
    idempotencyKey: string;
    templateKey: string;
    templateVersion: number;
    recipientHash: string;
  }): Promise<boolean>;
  markSent(idempotencyKey: string, sentAt: Date): Promise<void>;
  markFailed(idempotencyKey: string, errorCode: string): Promise<void>;
}
export async function deliverEmailJob(
  job: JobRecord,
  repository: DeliveryRepository,
  transport: MailTransport,
  now = new Date(),
) {
  const payload = payloadSchema.parse(job.payload);
  const rendered = renderEmailTemplate(
    payload.template as DeliveryTemplateKey,
    payload.values,
  );
  const deliveryKey = `email:${job.idempotencyKey}`;
  const reserved = await repository.reserve({
    jobId: job.id,
    tenantId: job.tenantId,
    idempotencyKey: deliveryKey,
    templateKey: payload.template,
    templateVersion: rendered.version,
    recipientHash: createHash("sha256")
      .update(payload.to.toLowerCase())
      .digest("hex"),
  });
  if (!reserved) return;
  try {
    await transport.send({
      to: payload.to,
      from: payload.from,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
    await repository.markSent(deliveryKey, now);
  } catch (error) {
    await repository.markFailed(
      deliveryKey,
      error instanceof Error ? error.name.slice(0, 80) : "UnknownError",
    );
    throw error;
  }
}
