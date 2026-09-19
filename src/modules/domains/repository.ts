import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { domains, tenants } from "@/db/schema";

import type { DomainTenant } from "./request-context";

export async function findActiveTenantByDomain(
  hostname: string,
): Promise<DomainTenant | null> {
  const [match] = await db
    .select({
      tenantId: domains.tenantId,
      domainId: domains.id,
      primary: domains.primary,
    })
    .from(domains)
    .innerJoin(tenants, eq(tenants.id, domains.tenantId))
    .where(
      and(
        eq(domains.hostname, hostname),
        inArray(domains.status, ["verified", "active"]),
        eq(tenants.status, "active"),
      ),
    )
    .limit(1);
  return match ?? null;
}

export async function findTenantPrimaryDomain(tenantId: string) {
  const [domain] = await db
    .select({
      id: domains.id,
      hostname: domains.hostname,
      status: domains.status,
      sslStatus: domains.sslStatus,
      verifiedAt: domains.verifiedAt,
      updatedAt: domains.updatedAt,
    })
    .from(domains)
    .where(and(eq(domains.tenantId, tenantId), eq(domains.primary, true)))
    .limit(1);
  return domain ?? null;
}
