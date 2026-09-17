export type TenantContext = Readonly<{
  tenantId: string;
  userId: string;
  source: "membership" | "platform_support";
}>;

export class TenantAccessDeniedError extends Error {
  constructor() {
    super(
      "Der Benutzer besitzt keinen geprüften Zugriff auf diesen Mandanten.",
    );
    this.name = "TenantAccessDeniedError";
  }
}

export function createMembershipTenantContext(input: {
  requestedTenantId: string;
  userId: string;
  activeTenantIds: readonly string[];
}): TenantContext {
  if (!input.activeTenantIds.includes(input.requestedTenantId)) {
    throw new TenantAccessDeniedError();
  }

  return Object.freeze({
    tenantId: input.requestedTenantId,
    userId: input.userId,
    source: "membership" as const,
  });
}

export function assertTenantRecord(
  context: TenantContext,
  recordTenantId: string,
): void {
  if (context.tenantId !== recordTenantId) {
    throw new TenantAccessDeniedError();
  }
}
