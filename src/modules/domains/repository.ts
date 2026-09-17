import "server-only";

import { and, eq } from "drizzle-orm";

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
        eq(domains.status, "active"),
        eq(tenants.status, "active"),
      ),
    )
    .limit(1);
  return match ?? null;
}
