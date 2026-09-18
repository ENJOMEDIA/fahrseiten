import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { tenants, trafficHourly } from "@/db/schema";

export async function recordPageView(input: {
  tenantId: string | null;
  scope: "platform" | "tenant" | "demo";
  hostname: string;
  path: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const hour = new Date(now);
  hour.setMinutes(0, 0, 0);
  const bucket = `${input.tenantId ?? "platform"}|${input.scope}|${input.hostname}|${input.path}|${hour.toISOString()}`;
  const id = createHash("sha256").update(bucket).digest("hex").slice(0, 36);
  await db
    .insert(trafficHourly)
    .values({
      id,
      tenantId: input.tenantId,
      scope: input.scope,
      hostname: input.hostname,
      path: input.path,
      hour,
      views: 1,
    })
    .onDuplicateKeyUpdate({
      set: { views: sql`${trafficHourly.views} + 1`, updatedAt: now },
    });
}

export async function getTrafficOverview(days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);
  const byTenant = await db
    .select({
      tenantId: trafficHourly.tenantId,
      tenantName: tenants.name,
      hostname: trafficHourly.hostname,
      views: sql<number>`sum(${trafficHourly.views})`,
    })
    .from(trafficHourly)
    .leftJoin(tenants, eq(tenants.id, trafficHourly.tenantId))
    .where(gte(trafficHourly.hour, since))
    .groupBy(trafficHourly.tenantId, tenants.name, trafficHourly.hostname)
    .orderBy(desc(sql`sum(${trafficHourly.views})`));
  const daily = await db
    .select({
      day: sql<string>`date(${trafficHourly.hour})`,
      views: sql<number>`sum(${trafficHourly.views})`,
    })
    .from(trafficHourly)
    .where(gte(trafficHourly.hour, since))
    .groupBy(sql`date(${trafficHourly.hour})`)
    .orderBy(sql`date(${trafficHourly.hour})`);
  const recent = await db
    .select()
    .from(trafficHourly)
    .where(and(gte(trafficHourly.hour, since), gte(trafficHourly.views, 1)))
    .orderBy(desc(trafficHourly.hour))
    .limit(30);
  return { since, byTenant, daily, recent };
}
