import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { domainConfig } from "@/modules/domains/config";
import { selectRequestHostname } from "@/modules/domains/hostname";
import { findActiveTenantByDomain } from "@/modules/domains/repository";
import { resolveRequestContext } from "@/modules/domains/request-context";

export default async function TenantSitePlaceholder({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const requestHeaders = await headers();
  const hostname = selectRequestHostname({
    host: requestHeaders.get("host"),
    forwardedHost: requestHeaders.get("x-forwarded-host"),
    trustProxyHeaders: domainConfig.trustProxyHeaders,
  });
  const context = await resolveRequestContext({
    hostname,
    ...domainConfig,
    findTenantByDomain: findActiveTenantByDomain,
  });
  if (context.kind !== "tenant") notFound();

  const { slug = [] } = await params;
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold text-cyan-700">Mandant geprüft</p>
      <h1 className="mt-3 text-4xl font-semibold">
        Öffentliche Fahrschulwebsite
      </h1>
      <p className="mt-4 text-slate-600">Tenant: {context.tenantId}</p>
      <p className="mt-1 text-slate-600">Pfad: /{slug.join("/")}</p>
    </main>
  );
}
