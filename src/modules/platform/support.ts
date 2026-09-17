import { z } from "zod";
export interface SupportAuditRepository {
  record(input: {
    actorUserId: string;
    tenantId: string;
    action: "support.view_opened";
    metadata: { reason: string };
  }): Promise<void>;
}
export async function openSupportView(input: {
  actorUserId: string;
  tenantId: string;
  reason: unknown;
  repository: SupportAuditRepository;
}) {
  const reason = z.string().trim().min(10).max(500).parse(input.reason);
  await input.repository.record({
    actorUserId: input.actorUserId,
    tenantId: input.tenantId,
    action: "support.view_opened",
    metadata: { reason },
  });
  return {
    tenantId: input.tenantId,
    mode: "read_only" as const,
    impersonated: false,
  };
}
