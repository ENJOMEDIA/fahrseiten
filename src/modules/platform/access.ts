import "server-only";
import { notFound, redirect } from "next/navigation";
import type { Permission } from "@/modules/auth/permissions";
import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
export async function requirePlatformPermission(permission: Permission) {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/login");
  if (!hasPlatformPermission(identity.platformRole, permission)) notFound();
  return identity;
}
