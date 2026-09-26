import { NextResponse } from "next/server";

import { domainConfig } from "@/modules/domains/config";
import { selectRequestHostname } from "@/modules/domains/hostname";
import { findActiveTenantByDomain } from "@/modules/domains/repository";
import { resolveRequestContext } from "@/modules/domains/request-context";
import { findTenantBrandingIds } from "@/modules/media/repository";
import { faviconMediaPath } from "@/modules/media/favicon-url";
import { findPlatformSettings } from "@/modules/setup/platform-settings";

const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0f172a"/><path d="M20 16h28v9H30v9h15v9H30v15H20z" fill="#67e8f9"/></svg>`;

export async function GET(request: Request) {
  try {
    const headers = new Headers(request.headers);
    const hostname = selectRequestHostname({
      host: headers.get("host"),
      forwardedHost: headers.get("x-forwarded-host"),
      trustProxyHeaders: domainConfig.trustProxyHeaders,
    });
    const context = await resolveRequestContext({
      hostname,
      ...domainConfig,
      findTenantByDomain: findActiveTenantByDomain,
    });
    const faviconId =
      context.kind === "tenant"
        ? (await findTenantBrandingIds(context.tenantId)).faviconMediaId
        : context.kind === "marketing" || context.kind === "app"
          ? (await findPlatformSettings())?.faviconMediaId
          : null;
    if (faviconId) {
      const response = new NextResponse(null, {
        status: 307,
        headers: { Location: faviconMediaPath(faviconId) },
      });
      response.headers.set(
        "Cache-Control",
        "private, no-store, max-age=0, must-revalidate",
      );
      return response;
    }
  } catch {
    // Bei einer noch nicht migrierten Datenbank bleibt das neutrale Favicon erreichbar.
  }

  return new NextResponse(fallback, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
