import { notFound, redirect } from "next/navigation";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge as Badge } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";
import { findTenantPrimaryDomain } from "@/modules/domains/repository";
import { getDnsTarget } from "@/modules/platform/domain-operations";
import { isTenantFeatureEnabled } from "@/modules/features/access";

export default async function DomainPage() {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/login");
  const membership = identity.memberships[0];
  if (!membership) notFound();
  if (!(await isTenantFeatureEnabled(membership.tenantId, "custom_domain")))
    redirect("/kunde/funktionen?feature=custom_domain");
  const [domain, target] = await Promise.all([
    findTenantPrimaryDomain(membership.tenantId),
    getDnsTarget().catch(() => ({
      hostname: "fahrseiten.de",
      ipv4: [] as string[],
      ipv6: [] as string[],
    })),
  ]);
  return (
    <CustomerPage
      title="Domainstatus"
      description="Aktueller DNS-, Verifikations- und SSL-Stand deiner echten Kundendomain."
    >
      {domain ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{domain.hostname}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Primäre Domain deiner FahrSeiten-Website
              </p>
            </div>
            <Badge tone={domain.status === "active" ? "success" : "warning"}>
              {domain.status === "active" ? "Aktiv" : "Einrichtung offen"}
            </Badge>
          </div>
          <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
            <dt>Verifikation</dt>
            <dd>{domain.verifiedAt ? "Bestätigt" : "Noch nicht bestätigt"}</dd>
            <dt>SSL</dt>
            <dd>
              {domain.sslStatus === "active"
                ? "HTTPS aktiv"
                : "Zertifikat noch offen"}
            </dd>
            <dt>Primärdomain</dt>
            <dd>Ja</dd>
          </dl>
          {domain.status !== "active" ? (
            <div className="mt-6 rounded-2xl bg-cyan-50 p-5 text-sm leading-6 text-cyan-950">
              <p className="font-semibold">Was jetzt passiert</p>
              <p className="mt-1">
                Dein Domainanbieter muss die Web-DNS-Einträge auf FahrSeiten
                ausrichten. Dein Ansprechpartner erhält dafür das Ziel{" "}
                <span className="font-mono">{target.hostname}</span>.
                E-Mail-Einträge bleiben bestehen. Danach werden DNS und SSL in
                der Plattformverwaltung geprüft.
              </p>
            </div>
          ) : null}
        </Card>
      ) : (
        <Card className="text-center">
          <h2 className="text-xl font-semibold">
            Noch keine Domain hinterlegt
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Bitte wende dich an deinen FahrSeiten-Ansprechpartner, damit deine
            Wunschdomain verbunden wird.
          </p>
        </Card>
      )}
    </CustomerPage>
  );
}
