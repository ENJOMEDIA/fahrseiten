import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import {
  listNewsletterCampaigns,
  listNewsletterRecipients,
} from "@/modules/platform/sales-newsletter";

import { SalesNav } from "../sales-nav";
import { NewsletterForm } from "./newsletter-form";

const date = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function NewsletterPage() {
  await requirePlatformPermission("platform.sales.manage");
  const [recipients, campaigns] = await Promise.all([
    listNewsletterRecipients(),
    listNewsletterCampaigns(),
  ]);
  return (
    <CustomerPage
      title="Newsletter"
      description="Produktneuigkeiten kontrolliert an Kontakte mit dokumentierter ausdrücklicher Einwilligung versenden."
    >
      <SalesNav />
      <NewsletterForm recipients={recipients} />
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Versandhistorie</h2>
        <div className="mt-4 space-y-3">
          {campaigns.length ? (
            campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-[.14em] text-cyan-700 uppercase">
                      {date.format(campaign.queuedAt)}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {campaign.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {campaign.subjectTemplate}
                    </p>
                  </div>
                  <StatusBadge
                    tone={campaign.failedCount ? "danger" : "success"}
                  >
                    {campaign.sentCount}/{campaign.recipientCount} versendet
                  </StatusBadge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">
                    {campaign.sentCount} abgeschlossen
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">
                    {campaign.pendingCount} ausstehend
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-800">
                    {campaign.failedCount} fehlgeschlagen
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-slate-600">
                Noch kein Newsletter eingeplant.
              </p>
            </Card>
          )}
        </div>
      </section>
    </CustomerPage>
  );
}
