import "server-only";

import { Reader } from "@maxmind/geoip2-node";

import { env } from "@/config/env";
import { clientIpFromHeader } from "./client-ip";

export type AnalyticsLocation = {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
};

const unknownLocation: AnalyticsLocation = {
  countryCode: null,
  countryName: null,
  region: null,
  city: null,
};

let reader: Awaited<ReturnType<typeof Reader.open>> | null | undefined;
let readerPath = "";

export function analyticsGeoConfiguration() {
  return {
    configured: Boolean(
      env.ANALYTICS_GEOIP_DATABASE_PATH &&
      env.ANALYTICS_CLIENT_IP_HEADER !== "none",
    ),
    ipHeader: env.ANALYTICS_CLIENT_IP_HEADER,
  };
}

function clean(value: string | undefined, maxLength: number) {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, maxLength) : null;
}

export function analyticsClientIp(headers: Headers) {
  return clientIpFromHeader(headers, env.ANALYTICS_CLIENT_IP_HEADER);
}

async function getReader() {
  const path = env.ANALYTICS_GEOIP_DATABASE_PATH;
  if (!path) return null;
  if (reader !== undefined && readerPath === path) return reader;
  readerPath = path;
  reader = await Reader.open(path).catch(() => null);
  return reader;
}

export async function resolveAnalyticsLocation(headers: Headers) {
  const ip = analyticsClientIp(headers);
  if (!ip) return unknownLocation;
  const database = await getReader();
  if (!database) return unknownLocation;
  try {
    const result = database.city(ip);
    const region = result.subdivisions?.at(-1);
    return {
      countryCode: clean(result.country?.isoCode, 2),
      countryName: clean(
        result.country?.names.de ?? result.country?.names.en,
        100,
      ),
      region: clean(region?.names.de ?? region?.names.en, 120),
      city: clean(result.city?.names.de ?? result.city?.names.en, 120),
    };
  } catch {
    return unknownLocation;
  }
}
