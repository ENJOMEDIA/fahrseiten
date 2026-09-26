import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { getSessionIdentity } from "@/modules/auth/session";
import { isTenantFeatureEnabled } from "@/modules/features/access";
import { redirect } from "next/navigation";
const tasks = [
  [
    "Website-Builder",
    "Theme wählen, Seiten anlegen, Inhaltsblöcke sortieren und die Darstellung auf allen Geräten prüfen. Veröffentlichte Seiten bilden automatisch das Menü.",
    "/kunde/website/builder",
  ],
  [
    "Inhalte",
    "Klassen, Preise, Kurse, Team, Fahrzeuge, Standorte und Bewertungen zentral pflegen",
    "/kunde/inhalte",
  ],
  [
    "Medien & Branding",
    "Logo, Favicon und Bilder hochladen, kategorisieren und wiederverwenden",
    "/kunde/medien",
  ],
  ["Domainstatus", "Verifikation und SSL-Hinweise prüfen", "/kunde/domain"],
  [
    "Rechtliches & Consent",
    "Texte und technische Einwilligungen verwalten",
    "/kunde/rechtliches",
  ],
] as const;
export default async function WebsiteOverviewPage() {
  const membership = (await getSessionIdentity())?.memberships[0];
  if (!membership) redirect("/login");
  if (!(await isTenantFeatureEnabled(membership.tenantId, "managed_website")))
    redirect("/kunde/funktionen?feature=managed_website");
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Website" },
        ]}
      />
      <h1 className="mt-6 text-3xl font-semibold">Website verwalten</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Alle öffentlichen Website-Einstellungen an einem Ort.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {tasks.map(([title, description, href]) => (
          <Card key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-slate-600">{description}</p>
            <Link
              className="mt-5 inline-block font-semibold text-cyan-800"
              href={href}
            >
              Öffnen
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
