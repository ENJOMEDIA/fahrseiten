export function customerNumberFromTenantId(tenantId: string) {
  const compact = tenantId.replaceAll("-", "").toUpperCase();
  if (!/^[0-9A-F]{32}$/.test(compact))
    throw new Error(
      "Für die Kundennummer wird eine gültige Tenant-ID benötigt.",
    );
  return `FS-${compact.slice(0, 12)}`;
}
