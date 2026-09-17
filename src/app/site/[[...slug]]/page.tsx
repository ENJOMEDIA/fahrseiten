import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { domainConfig } from "@/modules/domains/config";
import { selectRequestHostname } from "@/modules/domains/hostname";
import { findActiveTenantByDomain } from "@/modules/domains/repository";
import { resolveRequestContext } from "@/modules/domains/request-context";
import { findPublishedPage, findTenantWebsite } from "@/modules/cms/repository";
import { TenantSite } from "@/modules/cms/tenant-site";

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
  const [website, page] = await Promise.all([
    findTenantWebsite(context.tenantId),
    findPublishedPage(context.tenantId, slug.join("/")),
  ]);
  if (!website || !page) notFound();
  return <TenantSite page={page} website={website} />;
}
