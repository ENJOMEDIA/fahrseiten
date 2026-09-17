import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  domains,
  legalDocuments,
  sites,
  subscriptions,
  plans,
  tenantMemberships,
  tenants,
  users,
} from "@/db/schema";

export async function listPlatformTenants() {
  return db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      createdAt: tenants.createdAt,
      domain: domains.hostname,
      domainStatus: domains.status,
      sslStatus: domains.sslStatus,
      maintenanceMode: sites.maintenanceMode,
      ownerName: users.displayName,
      ownerEmail: users.email,
      planName: plans.publicName,
    })
    .from(tenants)
    .leftJoin(
      domains,
      and(eq(domains.tenantId, tenants.id), eq(domains.primary, true)),
    )
    .leftJoin(sites, eq(sites.tenantId, tenants.id))
    .leftJoin(
      tenantMemberships,
      and(
        eq(tenantMemberships.tenantId, tenants.id),
        eq(tenantMemberships.role, "tenant_owner"),
        eq(tenantMemberships.active, true),
      ),
    )
    .leftJoin(users, eq(users.id, tenantMemberships.userId))
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.tenantId, tenants.id),
        eq(subscriptions.status, "active"),
      ),
    )
    .leftJoin(plans, eq(plans.id, subscriptions.planId))
    .orderBy(desc(tenants.createdAt));
}

export async function findPlatformTenant(id: string) {
  const [tenant] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      createdAt: tenants.createdAt,
      updatedAt: tenants.updatedAt,
      domain: domains.hostname,
      domainId: domains.id,
      domainStatus: domains.status,
      sslStatus: domains.sslStatus,
      maintenanceMode: sites.maintenanceMode,
      maintenanceMessage: sites.maintenanceMessage,
      ownerName: users.displayName,
      ownerEmail: users.email,
      ownerActive: users.active,
      planName: plans.publicName,
    })
    .from(tenants)
    .leftJoin(
      domains,
      and(eq(domains.tenantId, tenants.id), eq(domains.primary, true)),
    )
    .leftJoin(sites, eq(sites.tenantId, tenants.id))
    .leftJoin(
      tenantMemberships,
      and(
        eq(tenantMemberships.tenantId, tenants.id),
        eq(tenantMemberships.role, "tenant_owner"),
        eq(tenantMemberships.active, true),
      ),
    )
    .leftJoin(users, eq(users.id, tenantMemberships.userId))
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.tenantId, tenants.id),
        eq(subscriptions.status, "active"),
      ),
    )
    .leftJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(tenants.id, id))
    .limit(1);

  if (!tenant) return null;
  const publishedLegal = await db
    .select({ documentType: legalDocuments.documentType })
    .from(legalDocuments)
    .where(
      and(
        eq(legalDocuments.tenantId, tenant.id),
        eq(legalDocuments.status, "published"),
      ),
    );
  return {
    ...tenant,
    publishedLegal: new Set(publishedLegal.map((row) => row.documentType)),
  };
}
