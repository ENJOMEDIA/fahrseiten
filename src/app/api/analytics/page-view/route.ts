import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordPageView } from "@/modules/analytics/repository";
import { resolveAnalyticsLocation } from "@/modules/analytics/geoip";
import { CONSENT_COOKIE, parseConsentCookie } from "@/modules/consent/model";
import { domainConfig } from "@/modules/domains/config";
import { selectRequestHostname } from "@/modules/domains/hostname";
import { findActiveTenantByDomain } from "@/modules/domains/repository";
import { resolveRequestContext } from "@/modules/domains/request-context";
import { isTrustedMutationRequest } from "@/modules/security/origin";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  const consent = parseConsentCookie(
    (await cookies()).get(CONSENT_COOKIE)?.value,
  );
  if (!consent?.choices.statistics)
    return new NextResponse(null, { status: 204 });
  try {
    const { path, timeZone, utcOffsetMinutes } = z
      .object({
        path: z.string().startsWith("/").max(300),
        timeZone: z.string().trim().max(64).catch(""),
        utcOffsetMinutes: z.number().int().min(-840).max(840).catch(0),
      })
      .parse(await request.json());
    const hostname = selectRequestHostname({
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      trustProxyHeaders: domainConfig.trustProxyHeaders,
    });
    const context = await resolveRequestContext({
      hostname,
      ...domainConfig,
      findTenantByDomain: findActiveTenantByDomain,
    });
    if (context.kind === "unknown" || context.kind === "app")
      return new NextResponse(null, { status: 204 });
    const location = await resolveAnalyticsLocation(request.headers);
    await recordPageView({
      tenantId: context.kind === "tenant" ? context.tenantId : null,
      scope:
        context.kind === "tenant"
          ? "tenant"
          : context.kind === "demo"
            ? "demo"
            : "platform",
      hostname,
      path,
      ...location,
      timeZone: timeZone || null,
      utcOffsetMinutes,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 422 });
  }
}
