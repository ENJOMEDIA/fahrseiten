import { normalizeHostname } from "./hostname";

export type DomainTenant = Readonly<{
  tenantId: string;
  domainId: string;
  primary: boolean;
}>;
export type RequestContext =
  | Readonly<{ kind: "marketing"; hostname: string }>
  | Readonly<{ kind: "app"; hostname: string }>
  | Readonly<{ kind: "demo"; hostname: string; tenantId: string }>
  | Readonly<{
      kind: "tenant";
      hostname: string;
      tenantId: string;
      domainId: string;
      primary: boolean;
    }>
  | Readonly<{ kind: "unknown"; hostname: string }>;

export async function resolveRequestContext(input: {
  hostname: string;
  marketingHosts: readonly string[];
  appHosts: readonly string[];
  demoHosts: readonly string[];
  demoTenantId: string;
  findTenantByDomain: (hostname: string) => Promise<DomainTenant | null>;
}): Promise<RequestContext> {
  const hostname = normalizeHostname(input.hostname);
  if (input.marketingHosts.includes(hostname))
    return { kind: "marketing", hostname };
  if (input.appHosts.includes(hostname)) return { kind: "app", hostname };
  if (input.demoHosts.includes(hostname))
    return { kind: "demo", hostname, tenantId: input.demoTenantId };
  const match = await input.findTenantByDomain(hostname);
  return match
    ? { kind: "tenant", hostname, ...match }
    : { kind: "unknown", hostname };
}
