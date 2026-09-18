import { NextResponse } from "next/server";

import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { findInvoiceForDownload } from "@/modules/billing/service";
import { getMediaStorage } from "@/modules/media/runtime-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const identity = await getSessionIdentity();
  if (!identity)
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const invoice = await findInvoiceForDownload((await params).id);
  if (!invoice)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  const platformAccess = hasPlatformPermission(
    identity.platformRole,
    "platform.tenants.manage",
  );
  const tenantAccess = identity.memberships.some(
    (membership) => membership.tenantId === invoice.tenantId,
  );
  if (!platformAccess && !tenantAccess)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  const bytes = await getMediaStorage().read(invoice.storageKey);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rechnung-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9._-]/g, "-")}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
