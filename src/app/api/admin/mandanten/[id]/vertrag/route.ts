import { NextResponse } from "next/server";

import { buildCurrentContractPdf } from "@/modules/contracts/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requirePlatformPermission("platform.tenants.manage");
  const tenantId = (await params).id;
  let contract: Awaited<ReturnType<typeof buildCurrentContractPdf>>;
  try {
    contract = await buildCurrentContractPdf(tenantId);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Der Vertrag konnte nicht erzeugt werden.",
      },
      { status: 409 },
    );
  }
  return new NextResponse(contract.bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fahrseiten-vertrag-${contract.customerNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
