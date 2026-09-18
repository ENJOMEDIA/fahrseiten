import { NextResponse } from "next/server";

import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { findContractDocumentForDownload } from "@/modules/contracts/service";
import { getMediaStorage } from "@/modules/media/runtime-storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const identity = await getSessionIdentity();
  if (!identity)
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const document = await findContractDocumentForDownload((await params).id);
  if (!document)
    return NextResponse.json(
      { error: "Vertrag wurde nicht gefunden." },
      { status: 404 },
    );
  const hasTenantAccess = identity.memberships.some(
    (membership) => membership.tenantId === document.tenantId,
  );
  const hasPlatformAccess = hasPlatformPermission(
    identity.platformRole,
    "platform.tenants.manage",
  );
  if (!hasTenantAccess && !hasPlatformAccess)
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });

  const kind = new URL(request.url).searchParams.get("datei") ?? "original";
  const storageKey =
    kind === "signiert"
      ? document.signedStorageKey
      : kind === "nachweis"
        ? document.evidenceStorageKey
        : document.storageKey;
  if (!storageKey)
    return NextResponse.json(
      { error: "Diese Vertragsdatei liegt noch nicht vor." },
      { status: 404 },
    );
  const bytes = await getMediaStorage().read(storageKey);
  const suffix =
    kind === "signiert" ? "-signiert" : kind === "nachweis" ? "-nachweis" : "";
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${document.contractNumber}${suffix}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
