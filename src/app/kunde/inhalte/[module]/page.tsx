import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  listTenantContentEntries,
  type ContentModuleKey,
} from "@/modules/content/management";
import { contentModules } from "@/modules/customer/navigation";
import { ContentEntryForm, EntryVisibilityForm } from "./content-entry-form";
export default async function ContentModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleConfig = contentModules[slug as keyof typeof contentModules];
  if (!moduleConfig) notFound();
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) notFound();
  const canWrite = hasTenantPermission(membership.role, "tenant.content.write");
  const entries = await listTenantContentEntries(
    membership.tenantId,
    slug as ContentModuleKey,
  );
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kundenbereich", href: "/kunde" },
          { label: "Inhalte", href: "/kunde/inhalte" },
          { label: moduleConfig.title },
        ]}
      />
      <h1 className="mt-6 text-3xl font-semibold">{moduleConfig.title}</h1>
      <p className="mt-3 text-slate-600">
        Hier erscheinen ausschließlich die tatsächlich für deine Fahrschule
        gespeicherten Inhalte.
      </p>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Gespeicherte Einträge</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
              {entries.length}
            </span>
          </div>
          {entries.length ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {entries.map((entry) => (
                <li
                  className="flex items-center justify-between gap-4 py-4"
                  key={entry.id}
                >
                  <div>
                    <p className="font-semibold">{entry.title}</p>
                    {entry.subtitle ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {entry.subtitle}
                      </p>
                    ) : null}
                    <p
                      className={`mt-1 text-xs font-semibold ${entry.active ? "text-emerald-700" : "text-slate-400"}`}
                    >
                      {entry.active ? "Sichtbar" : "Ausgeblendet"}
                    </p>
                  </div>
                  {canWrite ? (
                    <EntryVisibilityForm
                      active={entry.active}
                      id={entry.id}
                      module={slug as ContentModuleKey}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Noch keine Einträge vorhanden.
            </p>
          )}
        </section>
        {canWrite ? (
          <ContentEntryForm
            module={slug as ContentModuleKey}
            singular={moduleConfig.singular}
          />
        ) : null}
      </div>
    </>
  );
}
