import type { Metadata } from "next";
import { headers } from "next/headers";
import { ConsentManager } from "@/modules/consent/consent-manager";
import { getRequestOptionalServiceConfig } from "@/modules/consent/config";
import { TrafficTracker } from "@/modules/analytics/traffic-tracker";
import { domainConfig } from "@/modules/domains/config";
import { selectRequestHostname } from "@/modules/domains/hostname";
import { findActiveTenantByDomain } from "@/modules/domains/repository";
import { resolveRequestContext } from "@/modules/domains/request-context";
import { findTenantBrandingIds } from "@/modules/media/repository";
import { findPlatformSettings } from "@/modules/setup/platform-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  let hostname = "fahrseiten.de";
  let faviconId: string | null = null;

  try {
    const requestHeaders = await headers();
    hostname = selectRequestHostname({
      host: requestHeaders.get("host"),
      forwardedHost: requestHeaders.get("x-forwarded-host"),
      trustProxyHeaders: domainConfig.trustProxyHeaders,
    });
    const context = await resolveRequestContext({
      hostname,
      ...domainConfig,
      findTenantByDomain: findActiveTenantByDomain,
    });
    faviconId =
      context.kind === "tenant"
        ? (await findTenantBrandingIds(context.tenantId)).faviconMediaId
        : context.kind === "marketing" || context.kind === "app"
          ? ((await findPlatformSettings())?.faviconMediaId ?? null)
          : null;
  } catch {
    // Setup und Migrationen dürfen ein neutrales Favicon nicht blockieren.
  }

  const local = hostname === "localhost" || hostname.endsWith(".localhost");
  const origin = `${local ? "http" : "https"}://${hostname}`;
  const faviconUrl = new URL(
    `/api/favicon?asset=${encodeURIComponent(faviconId ?? "default-v3")}`,
    origin,
  ).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: "FahrSeiten – by ENJO MEDIA",
      template: "%s · FahrSeiten",
    },
    description: "Websites und digitale Werkzeuge für moderne Fahrschulen.",
    icons: {
      icon: [{ url: faviconUrl, sizes: "any" }],
      shortcut: faviconUrl,
    },
    openGraph: {
      title: "FahrSeiten – by ENJO MEDIA",
      description: "Die mandantenfähige Website-Plattform für Fahrschulen.",
      type: "website",
      locale: "de_DE",
      siteName: "FahrSeiten",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const optionalServices = await getRequestOptionalServiceConfig();
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <ConsentManager optionalServices={optionalServices} />
        <TrafficTracker
          enabled={optionalServices.some(
            (service) => service.category === "statistics",
          )}
        />
      </body>
    </html>
  );
}
