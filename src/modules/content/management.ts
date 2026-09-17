import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  courses,
  licenseClasses,
  locations,
  mediaUsages,
  priceGroups,
  teamMembers,
  vehicles,
} from "@/db/schema";
import { createId } from "@/lib/ids";

export type ContentModuleKey =
  | "fuehrerscheinklassen"
  | "preise"
  | "kurse"
  | "team"
  | "fahrzeuge"
  | "standorte";

export type ManagedContentEntry = {
  id: string;
  title: string;
  subtitle: string | null;
  active: boolean;
  imageUrl?: string | null;
};

export async function listTenantContentEntries(
  tenantId: string,
  module: ContentModuleKey,
): Promise<ManagedContentEntry[]> {
  switch (module) {
    case "fuehrerscheinklassen":
      return db
        .select({
          id: licenseClasses.id,
          title: licenseClasses.title,
          subtitle: licenseClasses.description,
          active: licenseClasses.active,
        })
        .from(licenseClasses)
        .where(eq(licenseClasses.tenantId, tenantId))
        .orderBy(asc(licenseClasses.position));
    case "preise":
      return db
        .select({
          id: priceGroups.id,
          title: priceGroups.title,
          subtitle: priceGroups.description,
          active: priceGroups.active,
        })
        .from(priceGroups)
        .where(eq(priceGroups.tenantId, tenantId))
        .orderBy(asc(priceGroups.position));
    case "kurse":
      return db
        .select({
          id: courses.id,
          title: courses.title,
          subtitle: courses.description,
          active: courses.active,
        })
        .from(courses)
        .where(eq(courses.tenantId, tenantId))
        .orderBy(asc(courses.position));
    case "team":
      return db
        .select({
          id: teamMembers.id,
          title: teamMembers.name,
          subtitle: teamMembers.role,
          active: teamMembers.active,
        })
        .from(teamMembers)
        .where(eq(teamMembers.tenantId, tenantId))
        .orderBy(asc(teamMembers.position));
    case "fahrzeuge":
      return (
        await db
          .select({
            id: vehicles.id,
            title: vehicles.name,
            subtitle: vehicles.category,
            active: vehicles.active,
            imageMediaId: vehicles.imageMediaId,
          })
          .from(vehicles)
          .where(eq(vehicles.tenantId, tenantId))
          .orderBy(asc(vehicles.position))
      ).map((entry) => ({
        ...entry,
        imageUrl: entry.imageMediaId ? `/media/${entry.imageMediaId}` : null,
      }));
    case "standorte":
      return db
        .select({
          id: locations.id,
          title: locations.name,
          subtitle: locations.city,
          active: locations.active,
        })
        .from(locations)
        .where(eq(locations.tenantId, tenantId))
        .orderBy(asc(locations.position));
  }
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requiredText(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (value.length < 2) throw new Error(`${label} ist erforderlich.`);
  return value;
}

export async function createTenantContentEntry(input: {
  tenantId: string;
  module: ContentModuleKey;
  formData: FormData;
}) {
  const id = createId();
  const title = text(input.formData, "title");
  if (title.length < 2)
    throw new Error("Bitte eine vollständige Bezeichnung eingeben.");
  switch (input.module) {
    case "fuehrerscheinklassen":
      await db.insert(licenseClasses).values({
        id,
        tenantId: input.tenantId,
        key: requiredText(
          input.formData,
          "key",
          "Das Klassenkürzel",
        ).toUpperCase(),
        title,
        description: text(input.formData, "description") || null,
        minimumAge: Number(text(input.formData, "minimumAge")) || null,
      });
      break;
    case "preise":
      await db.insert(priceGroups).values({
        id,
        tenantId: input.tenantId,
        title,
        description: text(input.formData, "description") || null,
      });
      break;
    case "kurse":
      await db.insert(courses).values({
        id,
        tenantId: input.tenantId,
        title,
        description: text(input.formData, "description") || null,
      });
      break;
    case "team":
      await db.insert(teamMembers).values({
        id,
        tenantId: input.tenantId,
        name: title,
        role: requiredText(input.formData, "role", "Die Rolle"),
        bio: text(input.formData, "description") || null,
        qualifications: text(input.formData, "qualifications")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      break;
    case "fahrzeuge":
      await db.transaction(async (tx) => {
        const imageMediaId = text(input.formData, "imageMediaId") || null;
        await tx.insert(vehicles).values({
          id,
          tenantId: input.tenantId,
          name: title,
          category: requiredText(
            input.formData,
            "category",
            "Die Fahrzeugkategorie",
          ),
          transmission:
            text(input.formData, "transmission") === "automatic"
              ? "automatic"
              : "manual",
          description: text(input.formData, "description") || null,
          imageMediaId,
        });
        if (imageMediaId)
          await tx.insert(mediaUsages).values({
            tenantId: input.tenantId,
            mediaId: imageMediaId,
            entityType: "vehicle",
            entityId: id,
          });
      });
      break;
    case "standorte":
      await db.insert(locations).values({
        id,
        tenantId: input.tenantId,
        name: title,
        street: requiredText(input.formData, "street", "Die Straße"),
        postalCode: requiredText(
          input.formData,
          "postalCode",
          "Die Postleitzahl",
        ),
        city: requiredText(input.formData, "city", "Der Ort"),
        phone: text(input.formData, "phone") || null,
        email: text(input.formData, "email") || null,
      });
      break;
  }
}

export async function setTenantContentEntryActive(input: {
  tenantId: string;
  module: ContentModuleKey;
  id: string;
  active: boolean;
}) {
  const whereFor = <
    T extends {
      tenantId: typeof licenseClasses.tenantId;
      id: typeof licenseClasses.id;
    },
  >(
    table: T,
  ) => and(eq(table.id, input.id), eq(table.tenantId, input.tenantId));
  switch (input.module) {
    case "fuehrerscheinklassen":
      await db
        .update(licenseClasses)
        .set({ active: input.active })
        .where(whereFor(licenseClasses));
      break;
    case "preise":
      await db
        .update(priceGroups)
        .set({ active: input.active })
        .where(
          and(
            eq(priceGroups.id, input.id),
            eq(priceGroups.tenantId, input.tenantId),
          ),
        );
      break;
    case "kurse":
      await db
        .update(courses)
        .set({ active: input.active })
        .where(
          and(eq(courses.id, input.id), eq(courses.tenantId, input.tenantId)),
        );
      break;
    case "team":
      await db
        .update(teamMembers)
        .set({ active: input.active })
        .where(
          and(
            eq(teamMembers.id, input.id),
            eq(teamMembers.tenantId, input.tenantId),
          ),
        );
      break;
    case "fahrzeuge":
      await db
        .update(vehicles)
        .set({ active: input.active })
        .where(
          and(eq(vehicles.id, input.id), eq(vehicles.tenantId, input.tenantId)),
        );
      break;
    case "standorte":
      await db
        .update(locations)
        .set({ active: input.active })
        .where(
          and(
            eq(locations.id, input.id),
            eq(locations.tenantId, input.tenantId),
          ),
        );
      break;
  }
}
