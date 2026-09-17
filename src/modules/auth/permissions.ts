import type { platformRoleValues, tenantRoleValues } from "@/db/schema";

export type PlatformRole = (typeof platformRoleValues)[number];
export type TenantRole = (typeof tenantRoleValues)[number];

export type Permission =
  | "platform.tenants.manage"
  | "platform.sales.manage"
  | "platform.support.diagnose"
  | "platform.security.manage"
  | "tenant.settings.manage"
  | "tenant.members.manage"
  | "tenant.content.read"
  | "tenant.content.write"
  | "tenant.content.publish"
  | "tenant.contacts.read";

const platformPermissions: Record<PlatformRole, readonly Permission[]> = {
  platform_owner: [
    "platform.tenants.manage",
    "platform.sales.manage",
    "platform.support.diagnose",
    "platform.security.manage",
  ],
  platform_sales: ["platform.sales.manage"],
  platform_support: ["platform.support.diagnose"],
};

const tenantPermissions: Record<TenantRole, readonly Permission[]> = {
  tenant_owner: [
    "tenant.settings.manage",
    "tenant.members.manage",
    "tenant.content.read",
    "tenant.content.write",
    "tenant.content.publish",
    "tenant.contacts.read",
  ],
  tenant_editor: [
    "tenant.content.read",
    "tenant.content.write",
    "tenant.content.publish",
  ],
  tenant_viewer: ["tenant.content.read"],
};

export function hasPlatformPermission(
  role: PlatformRole | null,
  permission: Permission,
): boolean {
  return role ? platformPermissions[role].includes(permission) : false;
}

export function hasTenantPermission(
  role: TenantRole | null,
  permission: Permission,
): boolean {
  return role ? tenantPermissions[role].includes(permission) : false;
}
