import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { parseServerEnv } from "@/config/env-schema";

import {
  auditLogs,
  domains,
  featureFlags,
  plans,
  planFeatures,
  sites,
  subscriptions,
  tenantFeatures,
  tenantMemberships,
  tenants,
  users,
} from "./schema";

const ids = {
  platformOwner: "00000000-0000-4000-8000-000000000001",
  tenantOwner: "00000000-0000-4000-8000-000000000002",
  demoTenant: "10000000-0000-4000-8000-000000000001",
  isolationTenant: "10000000-0000-4000-8000-000000000002",
  demoSite: "20000000-0000-4000-8000-000000000001",
  demoDomain: "30000000-0000-4000-8000-000000000001",
  localPlan: "40000000-0000-4000-8000-000000000001",
  subscription: "50000000-0000-4000-8000-000000000001",
  builderFeature: "60000000-0000-4000-8000-000000000001",
  schedulingFeature: "60000000-0000-4000-8000-000000000002",
  audit: "70000000-0000-4000-8000-000000000001",
} as const;

const env = parseServerEnv(process.env);
const connection = await mysql.createConnection(env.DATABASE_URL);
const db = drizzle({ client: connection });

try {
  await db.transaction(async (tx) => {
    await tx
      .insert(tenants)
      .values([
        {
          id: ids.demoTenant,
          name: "Fahrschule Morgenrot (Demo)",
          slug: "morgenrot-demo",
        },
        {
          id: ids.isolationTenant,
          name: "Fahrschule Nordstern (Test)",
          slug: "nordstern-test",
        },
      ])
      .onDuplicateKeyUpdate({ set: { status: "active" } });

    await tx
      .insert(users)
      .values([
        {
          id: ids.platformOwner,
          email: "plattform@fahrseiten.local",
          displayName: "Lokale Plattformverwaltung",
          platformRole: "platform_owner",
        },
        {
          id: ids.tenantOwner,
          email: "inhaber@morgenrot.local",
          displayName: "Mara Beispiel",
        },
      ])
      .onDuplicateKeyUpdate({ set: { active: true } });

    await tx
      .insert(tenantMemberships)
      .values({
        tenantId: ids.demoTenant,
        userId: ids.tenantOwner,
        role: "tenant_owner",
      })
      .onDuplicateKeyUpdate({ set: { role: "tenant_owner", active: true } });

    await tx
      .insert(sites)
      .values({
        id: ids.demoSite,
        tenantId: ids.demoTenant,
        name: "Morgenrot Demo-Website",
      })
      .onDuplicateKeyUpdate({ set: { name: "Morgenrot Demo-Website" } });

    await tx
      .insert(domains)
      .values({
        id: ids.demoDomain,
        tenantId: ids.demoTenant,
        hostname: "demo.fahrseiten.local",
        status: "active",
        primary: true,
        sslStatus: "local",
      })
      .onDuplicateKeyUpdate({ set: { status: "active", primary: true } });

    await tx
      .insert(plans)
      .values({
        id: ids.localPlan,
        key: "local_demo",
        internalName: "Lokaler Demo-Plan",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });

    await tx
      .insert(featureFlags)
      .values([
        {
          id: ids.builderFeature,
          key: "website_builder",
          title: "Website-Builder",
          defaultStatus: "enabled",
        },
        {
          id: ids.schedulingFeature,
          key: "lesson_scheduling",
          title: "Fahrstundenplanung",
          defaultStatus: "coming_soon",
        },
      ])
      .onDuplicateKeyUpdate({
        set: { description: "Lokale, vollständig fiktive Demo-Funktion" },
      });

    await tx
      .insert(planFeatures)
      .values({
        planId: ids.localPlan,
        featureId: ids.builderFeature,
        status: "enabled",
      })
      .onDuplicateKeyUpdate({ set: { status: "enabled" } });
    await tx
      .insert(planFeatures)
      .values({
        planId: ids.localPlan,
        featureId: ids.schedulingFeature,
        status: "coming_soon",
      })
      .onDuplicateKeyUpdate({ set: { status: "coming_soon" } });

    await tx
      .insert(subscriptions)
      .values({
        id: ids.subscription,
        tenantId: ids.demoTenant,
        planId: ids.localPlan,
        status: "active",
      })
      .onDuplicateKeyUpdate({ set: { status: "active" } });

    await tx
      .insert(tenantFeatures)
      .values({
        tenantId: ids.demoTenant,
        featureId: ids.builderFeature,
        status: "enabled",
        reason: "Lokaler Demo-Seed",
      })
      .onDuplicateKeyUpdate({
        set: { status: "enabled", reason: "Lokaler Demo-Seed" },
      });

    await tx
      .insert(auditLogs)
      .values({
        id: ids.audit,
        tenantId: ids.demoTenant,
        actorUserId: ids.platformOwner,
        action: "demo.seeded",
        entityType: "tenant",
        entityId: ids.demoTenant,
        metadata: { source: "local_seed" },
      })
      .onDuplicateKeyUpdate({ set: { action: "demo.seeded" } });
  });

  console.info("Fiktive lokale Demodaten wurden idempotent angelegt.");
} finally {
  await connection.end();
}
