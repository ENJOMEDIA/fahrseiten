"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db/client";
import { licenseClasses, locations, openingHours, vehicles } from "@/db/schema";
import { createId } from "@/lib/ids";
import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  markWebsiteSetupItem,
  recordWebsiteSetupReminder,
} from "@/modules/onboarding/website-setup";
import { standardLicenseClasses } from "@/modules/onboarding/license-class-catalog";

async function writableMembership() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!identity || !membership) redirect("/login");
  if (!hasTenantPermission(membership.role, "tenant.content.write")) notFound();
  return { identity, membership };
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string, label: string) {
  const result = value(formData, key);
  if (result.length < 2) throw new Error(`${label} fehlt.`);
  return result;
}

export async function saveLicenseSetupAction(formData: FormData) {
  const { membership } = await writableMembership();
  const selected = new Set(formData.getAll("classes").map(String));
  if (!selected.size)
    redirect(
      "/kunde/einrichtung?schritt=klassen&fehler=Bitte+mindestens+eine+Klasse+auswählen",
    );
  await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(licenseClasses)
      .where(eq(licenseClasses.tenantId, membership.tenantId));
    for (const [position, item] of standardLicenseClasses.entries()) {
      const row = existing.find((entry) => entry.key === item.key);
      const active = selected.has(item.key);
      if (row) {
        await tx
          .update(licenseClasses)
          .set({
            active,
            position,
            title: item.title,
            description:
              value(formData, `description_${item.key}`) || item.text,
            minimumAge: Number(value(formData, `age_${item.key}`)) || item.age,
          })
          .where(
            and(
              eq(licenseClasses.id, row.id),
              eq(licenseClasses.tenantId, membership.tenantId),
            ),
          );
      } else if (active) {
        await tx.insert(licenseClasses).values({
          id: createId(),
          tenantId: membership.tenantId,
          position,
          key: item.key,
          title: item.title,
          description: value(formData, `description_${item.key}`) || item.text,
          minimumAge: Number(value(formData, `age_${item.key}`)) || item.age,
        });
      }
    }
  });
  revalidatePath("/kunde", "layout");
  redirect("/kunde/einrichtung?schritt=standort&gespeichert=Klassen");
}

export async function saveLocationSetupAction(formData: FormData) {
  const { membership } = await writableMembership();
  const existing = await db
    .select()
    .from(locations)
    .where(eq(locations.tenantId, membership.tenantId))
    .orderBy(asc(locations.position))
    .limit(1);
  const locationId = existing[0]?.id ?? createId();
  const data = {
    name: required(formData, "name", "Standortname"),
    street: required(formData, "street", "Straße"),
    postalCode: required(formData, "postalCode", "Postleitzahl"),
    city: required(formData, "city", "Ort"),
    phone: value(formData, "phone") || null,
    email: value(formData, "email") || null,
  };
  await db.transaction(async (tx) => {
    if (existing[0])
      await tx
        .update(locations)
        .set(data)
        .where(
          and(
            eq(locations.id, locationId),
            eq(locations.tenantId, membership.tenantId),
          ),
        );
    else
      await tx
        .insert(locations)
        .values({ id: locationId, tenantId: membership.tenantId, ...data });
    for (let weekday = 1; weekday <= 7; weekday += 1) {
      const closed = formData.get(`closed_${weekday}`) === "on";
      await tx
        .insert(openingHours)
        .values({
          id: createId(),
          tenantId: membership.tenantId,
          locationId,
          weekday,
          opensAt: closed
            ? null
            : value(formData, `opens_${weekday}`) || "08:00",
          closesAt: closed
            ? null
            : value(formData, `closes_${weekday}`) || "18:00",
          closed,
        })
        .onDuplicateKeyUpdate({
          set: {
            opensAt: closed
              ? null
              : value(formData, `opens_${weekday}`) || "08:00",
            closesAt: closed
              ? null
              : value(formData, `closes_${weekday}`) || "18:00",
            closed,
          },
        });
    }
  });
  revalidatePath("/kunde", "layout");
  redirect("/kunde/einrichtung?schritt=fahrzeuge&gespeichert=Standort");
}

export async function addVehicleSetupAction(formData: FormData) {
  const { membership } = await writableMembership();
  await db.insert(vehicles).values({
    id: createId(),
    tenantId: membership.tenantId,
    name: required(formData, "name", "Fahrzeugname"),
    category: required(formData, "category", "Führerscheinklasse"),
    transmission:
      value(formData, "transmission") === "automatic" ? "automatic" : "manual",
    description: value(formData, "description") || null,
  });
  revalidatePath("/kunde", "layout");
  redirect("/kunde/einrichtung?schritt=fahrzeuge&gespeichert=Fahrzeug");
}

export async function recordSetupReminderAction() {
  const { identity, membership } = await writableMembership();
  await recordWebsiteSetupReminder({
    tenantId: membership.tenantId,
    userId: identity.id,
  });
}

export async function dismissSetupReminderAction() {
  const { identity, membership } = await writableMembership();
  await markWebsiteSetupItem({
    tenantId: membership.tenantId,
    userId: identity.id,
    key: "website_setup_prompt_dismissed",
    label: "Einrichtungshinweis dauerhaft ausgeblendet",
  });
  revalidatePath("/kunde", "layout");
}

export async function startBuilderFromGuideAction() {
  const { identity, membership } = await writableMembership();
  await markWebsiteSetupItem({
    tenantId: membership.tenantId,
    userId: identity.id,
    key: "website_setup_builder_started",
    label: "Builder-Einführung abgeschlossen",
  });
  revalidatePath("/kunde", "layout");
  redirect("/kunde/website/builder");
}
