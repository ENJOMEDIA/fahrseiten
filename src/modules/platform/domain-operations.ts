import "server-only";

import { resolve4, resolve6 } from "node:dns/promises";
import { connect } from "node:tls";

import { and, eq } from "drizzle-orm";

import { env } from "@/config/env";
import { db } from "@/db/client";
import { domains } from "@/db/schema";
import { normalizeHostname } from "@/modules/domains/hostname";

async function addresses(hostname: string) {
  const [ipv4, ipv6] = await Promise.all([
    resolve4(hostname).catch(() => [] as string[]),
    resolve6(hostname).catch(() => [] as string[]),
  ]);
  return { ipv4, ipv6 };
}

function hasIntersection(left: string[], right: string[]) {
  const expected = new Set(right);
  return left.some((value) => expected.has(value));
}

async function checkTls(hostname: string) {
  return new Promise<boolean>((resolve) => {
    const socket = connect({
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: true,
    });
    const finish = (result: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(7_000, () => finish(false));
    socket.once("secureConnect", () => finish(socket.authorized));
    socket.once("error", () => finish(false));
  });
}

async function checkApplicationRoute(hostname: string, sslActive: boolean) {
  const protocol = sslActive ? "https" : "http";
  try {
    const response = await fetch(`${protocol}://${hostname}/api/health`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      redirect: "manual",
      signal: AbortSignal.timeout(7_000),
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { service?: unknown };
    return body.service === "fahrseiten";
  } catch {
    return false;
  }
}

export async function getDnsTarget() {
  const hostname = normalizeHostname(new URL(env.APP_BASE_URL).hostname);
  return { hostname, ...(await addresses(hostname)) };
}

export async function inspectTenantDomain(hostname: string) {
  const normalized = normalizeHostname(hostname);
  const [target, actual] = await Promise.all([
    getDnsTarget(),
    addresses(normalized),
  ]);
  const dnsMatches =
    hasIntersection(actual.ipv4, target.ipv4) ||
    hasIntersection(actual.ipv6, target.ipv6) ||
    normalized === target.hostname;
  const sslActive = dnsMatches ? await checkTls(normalized) : false;
  const appReachable = dnsMatches
    ? await checkApplicationRoute(normalized, sslActive)
    : false;
  return {
    hostname: normalized,
    target,
    actual,
    dnsMatches,
    sslActive,
    appReachable,
  };
}

export async function checkAndPersistTenantDomain(input: {
  tenantId: string;
  domainId: string;
}) {
  const [domain] = await db
    .select({ hostname: domains.hostname })
    .from(domains)
    .where(
      and(eq(domains.id, input.domainId), eq(domains.tenantId, input.tenantId)),
    )
    .limit(1);
  if (!domain) throw new Error("Domain wurde nicht gefunden.");
  const result = await inspectTenantDomain(domain.hostname);
  await db
    .update(domains)
    .set({
      status: !result.dnsMatches
        ? "verification_required"
        : !result.appReachable
          ? "error"
          : result.sslActive
            ? "active"
            : "verified",
      verifiedAt: result.dnsMatches ? new Date() : null,
      sslStatus: result.sslActive
        ? "active"
        : result.dnsMatches
          ? "pending"
          : "unknown",
    })
    .where(
      and(eq(domains.id, input.domainId), eq(domains.tenantId, input.tenantId)),
    );
  return result;
}

export async function updateTenantDomain(input: {
  tenantId: string;
  domainId: string;
  hostname: string;
}) {
  const hostname = normalizeHostname(input.hostname);
  const result = await db
    .update(domains)
    .set({
      hostname,
      status: "pending",
      sslStatus: "unknown",
      verifiedAt: null,
    })
    .where(
      and(eq(domains.id, input.domainId), eq(domains.tenantId, input.tenantId)),
    );
  if (result[0].affectedRows !== 1)
    throw new Error("Domain wurde nicht gefunden.");
}
