import { randomUUID } from "node:crypto";
import type { TemplateKey } from "@/modules/notifications/templates";
export type EnqueueEmailInput = {
  tenantId: string | null;
  idempotencyKey: string;
  to: string;
  from: string;
  template: TemplateKey;
  values: Record<string, unknown>;
  runAt?: Date;
};
export interface JobQueueRepository {
  enqueue(input: {
    id: string;
    tenantId: string | null;
    type: "notification";
    idempotencyKey: string;
    payload: Record<string, unknown>;
    runAt: Date;
  }): Promise<boolean>;
}
export async function enqueueEmailJob(
  input: EnqueueEmailInput,
  repository: JobQueueRepository,
) {
  return repository.enqueue({
    id: randomUUID(),
    tenantId: input.tenantId,
    type: "notification",
    idempotencyKey: input.idempotencyKey,
    payload: {
      to: input.to,
      from: input.from,
      template: input.template,
      values: input.values,
    },
    runAt: input.runAt ?? new Date(),
  });
}
