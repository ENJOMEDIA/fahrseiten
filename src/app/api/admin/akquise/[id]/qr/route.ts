import QRCode from "qrcode";
import { z } from "zod";

import { requirePlatformPermission } from "@/modules/platform/access";
import { postalCampaignUrl } from "@/modules/platform/postal-campaign";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requirePlatformPermission("platform.sales.manage");
  const { id } = await params;
  const leadId = z.uuid().parse(id);
  const svg = await QRCode.toString(postalCampaignUrl(leadId), {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#020617", light: "#ffffff" },
  });
  return new Response(svg, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="fahrseiten-akquise-${leadId}.svg"`,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
