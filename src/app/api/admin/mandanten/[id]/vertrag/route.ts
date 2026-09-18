import { NextResponse } from "next/server";
import sharp from "sharp";

import { createContractPdf } from "@/modules/contracts/pdf";
import { findPlatformLegalProfile } from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformTenant } from "@/modules/platform/tenant-directory";
import { findTenantBilling } from "@/modules/billing/service";
import {
  findPlatformLogoId,
  findPublicMedia,
} from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";

async function loadContractLogo() {
  const logoId = await findPlatformLogoId();
  if (!logoId) return undefined;
  const asset = await findPublicMedia(logoId);
  if (!asset) return undefined;
  const source = await getMediaStorage().read(asset.storageKey);
  return new Uint8Array(
    await sharp(source)
      .resize({
        width: 620,
        height: 168,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer(),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requirePlatformPermission("platform.tenants.manage");
  const tenantId = (await params).id;
  const [tenant, billing, platform, brandLogoPng] = await Promise.all([
    findPlatformTenant(tenantId),
    findTenantBilling(tenantId),
    findPlatformLegalProfile(),
    loadContractLogo().catch(() => undefined),
  ]);
  if (!tenant || !billing.profile || !billing.subscription || !platform)
    return NextResponse.json(
      {
        error: "Für den Vertrag fehlen Anbieter-, Rechnungs- oder Paketdaten.",
      },
      { status: 409 },
    );
  const contractNumber = `V-${tenant.customerNumber}-${billing.subscription.id.slice(0, 8).toUpperCase()}`;
  const bytes = await createContractPdf({
    brandLogoPng,
    contractNumber,
    customerNumber: tenant.customerNumber,
    provider: {
      companyName: platform.data.companyName,
      representativeName: platform.data.representativeName,
      street: platform.data.street,
      postalCode: platform.data.postalCode,
      city: platform.data.city,
      country: platform.data.country,
      email: platform.data.email,
    },
    customer: billing.profile,
    packageName: billing.subscription.planNameSnapshot,
    monthlyPriceCents: billing.subscription.monthlyPriceCentsSnapshot,
    setupPriceCents: billing.subscription.setupPriceCentsSnapshot,
    startsAt: billing.subscription.startsAt,
    minimumTermMonths: billing.subscription.minimumTermMonths,
    billingIntervalMonths: billing.subscription.billingIntervalMonths,
    nextInvoiceAt: billing.subscription.nextInvoiceAt,
  });
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fahrseiten-vertrag-${tenant.customerNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
