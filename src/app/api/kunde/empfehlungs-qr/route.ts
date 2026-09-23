import QRCode from "qrcode";

import { getSessionIdentity } from "@/modules/auth/session";
import { findTenantReferralProgram } from "@/modules/referrals/service";

export async function GET() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) return new Response("Nicht angemeldet", { status: 401 });
  const program = await findTenantReferralProgram(membership.tenantId);
  if (!program.code?.active || !program.shareUrl)
    return new Response("Kein aktiver Empfehlungslink", { status: 404 });
  const png = await QRCode.toBuffer(program.shareUrl, {
    type: "png",
    width: 1200,
    margin: 3,
    errorCorrectionLevel: "H",
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="fahrseiten-empfehlung.png"',
      "Cache-Control": "private, no-store",
    },
  });
}
