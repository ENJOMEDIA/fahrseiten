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
import { licenseClassKeySchema } from "./schemas";

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
  fields: {
    description?: string;
    key?: string;
    minimumAge?: number;
    role?: string;
    qualifications?: string;
    category?: string;
    transmission?: "manual" | "automatic";
    imageMediaId?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    phone?: string;
    email?: string;
  };
};

export async function listTenantContentEntries(
  tenantId: string,
  module: ContentModuleKey,
): Promise<ManagedContentEntry[]> {
  switch (module) {
    case "fuehrerscheinklassen":
      return (
        await db
          .select({
            id: licenseClasses.id,
            title: licenseClasses.title,
            subtitle: licenseClasses.description,
            active: licenseClasses.active,
            key: licenseClasses.key,
            minimumAge: licenseClasses.minimumAge,
          })
          .from(licenseClasses)
          .where(eq(licenseClasses.tenantId, tenantId))
          .orderBy(asc(licenseClasses.position))
      ).map((entry) => ({
        ...entry,
        fields: {
          description: entry.subtitle ?? "",
          key: entry.key,
          minimumAge: entry.minimumAge ?? undefined,
        },
      }));
    case "preise":
      return (
        await db
          .select({
            id: priceGroups.id,
            title: priceGroups.title,
            subtitle: priceGroups.description,
            active: priceGroups.active,
          })
          .from(priceGroups)
          .where(eq(priceGroups.tenantId, tenantId))
          .orderBy(asc(priceGroups.position))
      ).map((entry) => ({
        ...entry,
        fields: { description: entry.subtitle ?? "" },
      }));
    case "kurse":
      return (
        await db
          .select({
            id: courses.id,
            title: courses.title,
            subtitle: courses.description,
            active: courses.active,
          })
          .from(courses)
          .where(eq(courses.tenantId, tenantId))
          .orderBy(asc(courses.position))
      ).map((entry) => ({
        ...entry,
        fields: { description: entry.subtitle ?? "" },
      }));
    case "team":
      return (
        await db
          .select({
            id: teamMembers.id,
            title: teamMembers.name,
            subtitle: teamMembers.role,
            active: teamMembers.active,
            bio: teamMembers.bio,
            qualifications: teamMembers.qualifications,
            imageMediaId: teamMembers.imageMediaId,
          })
          .from(teamMembers)
          .where(eq(teamMembers.tenantId, tenantId))
          .orderBy(asc(teamMembers.position))
      ).map((entry) => ({
        ...entry,
        imageUrl: entry.imageMediaId ? `/media/${entry.imageMediaId}` : null,
        fields: {
          description: entry.bio ?? "",
          role: entry.subtitle ?? "",
          qualifications: entry.qualifications.join(", "),
          imageMediaId: entry.imageMediaId ?? undefined,
        },
      }));
    case "fahrzeuge":
      return (
        await db
          .select({
            id: vehicles.id,
            title: vehicles.name,
            subtitle: vehicles.category,
            active: vehicles.active,
            imageMediaId: vehicles.imageMediaId,
            description: vehicles.description,
            transmission: vehicles.transmission,
          })
          .from(vehicles)
          .where(eq(vehicles.tenantId, tenantId))
          .orderBy(asc(vehicles.position))
      ).map((entry) => ({
        ...entry,
        imageUrl: entry.imageMediaId ? `/media/${entry.imageMediaId}` : null,
        fields: {
          description: entry.description ?? "",
          category: entry.subtitle ?? "",
          transmission: entry.transmission,
          imageMediaId: entry.imageMediaId ?? undefined,
        },
      }));
    case "standorte":
      return (
        await db
          .select({
            id: locations.id,
            title: locations.name,
            subtitle: locations.city,
            active: locations.active,
            street: locations.street,
            postalCode: locations.postalCode,
            phone: locations.phone,
            email: locations.email,
          })
          .from(locations)
          .where(eq(locations.tenantId, tenantId))
          .orderBy(asc(locations.position))
      ).map((entry) => ({
        ...entry,
        fields: {
          street: entry.street,
          postalCode: entry.postalCode,
          city: entry.subtitle ?? "",
          phone: entry.phone ?? "",
          email: entry.email ?? "",
        },
      }));
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

function requiredKey(formData: FormData) {
  return licenseClassKeySchema.parse(text(formData, "key"));
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
        key: requiredKey(input.formData),
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
      await db.transaction(async (tx) => {
        const imageMediaId = text(input.formData, "imageMediaId") || null;
        await tx.insert(teamMembers).values({
          id,
          tenantId: input.tenantId,
          name: title,
          role: requiredText(input.formData, "role", "Die Rolle"),
          bio: text(input.formData, "description") || null,
          qualifications: text(input.formData, "qualifications")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          imageMediaId,
        });
        if (imageMediaId)
          await tx.insert(mediaUsages).values({
            tenantId: input.tenantId,
            mediaId: imageMediaId,
            entityType: "team",
            entityId: id,
          });
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

export async function updateTenantContentEntry(input: {
  tenantId: string;
  module: ContentModuleKey;
  id: string;
  formData: FormData;
}) {
  const title = requiredText(input.formData, "title", "Die Bezeichnung");
  const scoped = <
    T extends {
      id: typeof licenseClasses.id;
      tenantId: typeof licenseClasses.tenantId;
    },
  >(
    table: T,
  ) => and(eq(table.id, input.id), eq(table.tenantId, input.tenantId));
  switch (input.module) {
    case "fuehrerscheinklassen":
      await db
        .update(licenseClasses)
        .set({
          key: requiredKey(input.formData),
          title,
          description: text(input.formData, "description") || null,
          minimumAge: Number(text(input.formData, "minimumAge")) || null,
        })
        .where(scoped(licenseClasses));
      break;
    case "preise":
      await db
        .update(priceGroups)
        .set({
          title,
          description: text(input.formData, "description") || null,
        })
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
        .set({
          title,
          description: text(input.formData, "description") || null,
        })
        .where(
          and(eq(courses.id, input.id), eq(courses.tenantId, input.tenantId)),
        );
      break;
    case "team":
      await updateMediaContentEntry(input, "team", async (tx, imageMediaId) => {
        await tx
          .update(teamMembers)
          .set({
            name: title,
            role: requiredText(input.formData, "role", "Die Rolle"),
            bio: text(input.formData, "description") || null,
            qualifications: text(input.formData, "qualifications")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            imageMediaId,
          })
          .where(
            and(
              eq(teamMembers.id, input.id),
              eq(teamMembers.tenantId, input.tenantId),
            ),
          );
      });
      break;
    case "fahrzeuge":
      await updateMediaContentEntry(
        input,
        "vehicle",
        async (tx, imageMediaId) => {
          await tx
            .update(vehicles)
            .set({
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
            })
            .where(
              and(
                eq(vehicles.id, input.id),
                eq(vehicles.tenantId, input.tenantId),
              ),
            );
        },
      );
      break;
    case "standorte":
      await db
        .update(locations)
        .set({
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
        })
        .where(
          and(
            eq(locations.id, input.id),
            eq(locations.tenantId, input.tenantId),
          ),
        );
      break;
  }
}

async function updateMediaContentEntry(
  input: { tenantId: string; id: string; formData: FormData },
  entityType: "team" | "vehicle",
  update: (
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    imageMediaId: string | null,
  ) => Promise<void>,
) {
  const imageMediaId = text(input.formData, "imageMediaId") || null;
  await db.transaction(async (tx) => {
    await tx
      .delete(mediaUsages)
      .where(
        and(
          eq(mediaUsages.tenantId, input.tenantId),
          eq(mediaUsages.entityType, entityType),
          eq(mediaUsages.entityId, input.id),
        ),
      );
    await update(tx, imageMediaId);
    if (imageMediaId)
      await tx.insert(mediaUsages).values({
        tenantId: input.tenantId,
        mediaId: imageMediaId,
        entityType,
        entityId: input.id,
      });
  });
}

export async function deleteTenantContentEntry(input: {
  tenantId: string;
  module: ContentModuleKey;
  id: string;
}) {
  await db.transaction(async (tx) => {
    await tx
      .delete(mediaUsages)
      .where(
        and(
          eq(mediaUsages.tenantId, input.tenantId),
          eq(mediaUsages.entityId, input.id),
        ),
      );
    switch (input.module) {
      case "fuehrerscheinklassen":
        await tx
          .delete(licenseClasses)
          .where(
            and(
              eq(licenseClasses.id, input.id),
              eq(licenseClasses.tenantId, input.tenantId),
            ),
          );
        break;
      case "preise":
        await tx
          .delete(priceGroups)
          .where(
            and(
              eq(priceGroups.id, input.id),
              eq(priceGroups.tenantId, input.tenantId),
            ),
          );
        break;
      case "kurse":
        await tx
          .delete(courses)
          .where(
            and(eq(courses.id, input.id), eq(courses.tenantId, input.tenantId)),
          );
        break;
      case "team":
        await tx
          .delete(teamMembers)
          .where(
            and(
              eq(teamMembers.id, input.id),
              eq(teamMembers.tenantId, input.tenantId),
            ),
          );
        break;
      case "fahrzeuge":
        await tx
          .delete(vehicles)
          .where(
            and(
              eq(vehicles.id, input.id),
              eq(vehicles.tenantId, input.tenantId),
            ),
          );
        break;
      case "standorte":
        await tx
          .delete(locations)
          .where(
            and(
              eq(locations.id, input.id),
              eq(locations.tenantId, input.tenantId),
            ),
          );
        break;
    }
  });
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
