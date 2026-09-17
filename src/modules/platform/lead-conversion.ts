export type ConvertibleLead = {
  id: string;
  companyName: string;
  status: "won" | string;
  convertedTenantId?: string | null;
};
export interface LeadConversionRepository {
  findLeadForUpdate(leadId: string): Promise<ConvertibleLead | null>;
  createTenantFromLead(input: { name: string; slug: string }): Promise<string>;
  markConverted(leadId: string, tenantId: string): Promise<void>;
}
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
export async function convertWonLead(
  leadId: string,
  repository: LeadConversionRepository,
) {
  const lead = await repository.findLeadForUpdate(leadId);
  if (!lead) throw new Error("Lead nicht gefunden.");
  if (lead.convertedTenantId) return lead.convertedTenantId;
  if (lead.status !== "won")
    throw new Error("Nur gewonnene Leads können umgewandelt werden.");
  const tenantId = await repository.createTenantFromLead({
    name: lead.companyName,
    slug: slugify(lead.companyName),
  });
  await repository.markConverted(lead.id, tenantId);
  return tenantId;
}
