import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { MaintenancePage } from "@/components/maintenance/maintenance-page";
import { domainConfig } from "@/modules/domains/config";
import { selectRequestHostname } from "@/modules/domains/hostname";
import { findActiveTenantByDomain } from "@/modules/domains/repository";
import { resolveRequestContext } from "@/modules/domains/request-context";
import { findPublishedPage, findTenantWebsite } from "@/modules/cms/repository";
import { TenantSite } from "@/modules/cms/tenant-site";
import { getOptionalServiceConfig } from "@/modules/consent/config";
import { findPublishedTenantLegalDocument } from "@/modules/legal/repository";
import {
  PublicCookieSettings,
  PublicLegalDocument,
  PublicLegalDocumentUnavailable,
} from "@/modules/legal/public-document";

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

  const website = await findTenantWebsite(context.tenantId);
  if (!website) notFound();
  const { slug = [] } = await params;
  const path = slug.join("/");
  const legalType =
    path === "impressum"
      ? "imprint"
      : path === "datenschutz"
        ? "privacy"
        : null;
  if (legalType) {
    const document = await findPublishedTenantLegalDocument(
      context.tenantId,
      legalType,
    );
    if (document)
      return (
        <PublicLegalDocument
          brandName={website.name}
          content={document.content}
          title={legalType === "imprint" ? "Impressum" : "Datenschutz"}
          optionalServices={
            legalType === "privacy"
              ? await getOptionalServiceConfig(context.tenantId)
              : []
          }
        />
      );
    return (
      <PublicLegalDocumentUnavailable
        brandName={website.name}
        title={legalType === "imprint" ? "Impressum" : "Datenschutz"}
      />
    );
  }
  if (path === "cookie-einstellungen")
    return (
      <PublicCookieSettings
        brandName={website.name}
        optionalServices={await getOptionalServiceConfig(context.tenantId)}
      />
    );
  if (website.maintenanceMode) {
    return (
      <MaintenancePage
        accentColor={website.theme.accentColor}
        brandName={website.name}
        logoUrl={website.theme.logoUrl}
        message={website.maintenanceMessage}
        primaryColor={website.theme.primaryColor}
        variant="tenant"
      />
    );
  }

  const page = await findPublishedPage(context.tenantId, path);
  if (!page) notFound();
  return <TenantSite page={page} website={website} />;
}
