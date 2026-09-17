import { env } from "@/config/env";

function list(value: string): string[] {
  return value
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

export const domainConfig = {
  trustProxyHeaders: env.TRUST_PROXY_HEADERS,
  marketingHosts: list(env.MARKETING_HOSTS),
  appHosts: list(env.APP_HOSTS),
  demoHosts: list(env.DEMO_HOSTS),
  demoTenantId: "10000000-0000-4000-8000-000000000001",
} as const;
