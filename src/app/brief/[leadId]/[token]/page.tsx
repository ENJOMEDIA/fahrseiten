import { redirect } from "next/navigation";

export default async function PostalCampaignLinkPage({
  params,
}: {
  params: Promise<{ leadId: string; token: string }>;
}) {
  const { leadId, token } = await params;
  redirect(
    `/brief/${encodeURIComponent(leadId)}?token=${encodeURIComponent(token)}`,
  );
}
