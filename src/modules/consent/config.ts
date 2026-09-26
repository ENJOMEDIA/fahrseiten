import "server-only";

import { headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { env } from "@/config/env";
import { db } from "@/db/client";
import { legalProfiles } from "@/db/schema";
import { domainConfig } from "@/modules/domains/config";
import { selectRequestHostname } from "@/modules/domains/hostname";
import { findActiveTenantByDomain } from "@/modules/domains/repository";
import { resolveRequestContext } from "@/modules/domains/request-context";
import { findRequiredTenantLegalModules } from "@/modules/legal/repository";

import type { ConsentCategory } from "./model";

export type OptionalService = {
  category: ConsentCategory;
  label: string;
  services: string;
};

export async function getOptionalServiceConfig(
  tenantId?: string | null,
): Promise<OptionalService[]> {
  const services: OptionalService[] = [];
  let modules: Record<string, boolean> = {};
  try {
    const [profile] = await db
      .select({ modules: legalProfiles.modules })
      .from(legalProfiles)
      .where(
        tenantId
          ? and(
              eq(legalProfiles.tenantId, tenantId),
              eq(legalProfiles.profileKey, tenantId),
            )
          : and(
              isNull(legalProfiles.tenantId),
              eq(legalProfiles.profileKey, "platform"),
            ),
      )
      .limit(1);
    modules = profile?.modules ?? {};
    if (tenantId)
      for (const key of await findRequiredTenantLegalModules(tenantId))
        modules[key] = true;
  } catch {
    modules = {};
  }
  if (!tenantId || modules.analytics)
    services.push({
      category: "statistics",
      label: "Datenschutzfreundliche Statistik",
      services:
        "FahrSeiten Reichweitenmessung (nur nach Einwilligung; Pfad, Host, Zugriffszeit und Browser-Zeitzone; bei konfigurierter lokaler GeoIP-Datenbank grobe Stadt, Region und Land; keine Speicherung oder externe Übermittlung der IP-Adresse; kein Besucherprofil)",
    });
  if (modules.maps)
    services.push({
      category: "functional",
      label: "Kartendarstellung",
      services: "Der im Mandanten konfigurierte Kartendienst",
    });
  if (modules.video)
    services.push({
      category: "functional",
      label: "Externe Videos",
      services: "Der im Mandanten konfigurierte Videodienst",
    });
  if (modules.marketing)
    services.push({
      category: "marketing",
      label: "Marketing und Anzeigen",
      services: "Die im Mandanten aktivierten Kampagnen- und Anzeigenmodule",
    });
  const configured = [
    {
      category: "functional",
      label: "Funktional",
      services: env.CONSENT_FUNCTIONAL_SERVICES,
    },
    {
      category: "statistics",
      label: "Statistik",
      services: env.CONSENT_STATISTICS_SERVICES,
    },
    {
      category: "marketing",
      label: "Marketing",
      services: env.CONSENT_MARKETING_SERVICES,
    },
  ].filter((entry) => entry.services.trim().length > 0) as OptionalService[];
  return [...services, ...configured].reduce<OptionalService[]>(
    (result, item) => {
      const existing = result.find((entry) => entry.category === item.category);
      if (existing) {
        existing.label =
          item.category === "functional"
            ? "Komfortfunktionen"
            : item.category === "statistics"
              ? "Statistik"
              : "Marketing";
        existing.services = `${existing.services}; ${item.services}`;
      } else result.push({ ...item });
      return result;
    },
    [],
  );
}

export async function getRequestOptionalServiceConfig() {
  try {
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
    return getOptionalServiceConfig(
      context.kind === "tenant" ? context.tenantId : null,
    );
  } catch {
    return getOptionalServiceConfig(null);
  }
}
