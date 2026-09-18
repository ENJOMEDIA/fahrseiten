import { buildSalesOfferPdf } from "@/modules/offers/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requirePlatformPermission("platform.sales.manage");
  const { id } = await params;
  const result = await buildSalesOfferPdf(id);
  if (!result)
    return Response.json({ error: "Angebot nicht gefunden." }, { status: 404 });
  return new Response(Buffer.from(result.bytes), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="fahrseiten-${result.offer.offerNumber}.pdf"`,
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
