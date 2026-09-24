import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  licenseClasses,
  locations,
  onboardingItems,
  openingHours,
  priceGroups,
  teamMembers,
  vehicles,
} from "@/db/schema";

export const websiteSetupSteps = [
  {
    key: "classes",
    label: "Führerscheinklassen",
    description: "Angebot auswählen und kurz beschreiben",
  },
  {
    key: "location",
    label: "Standort & Zeiten",
    description: "Kontakt, Anschrift und Erreichbarkeit prüfen",
  },
  {
    key: "vehicles",
    label: "Fuhrpark",
    description: "Mindestens ein Ausbildungsfahrzeug ergänzen",
  },
  {
    key: "details",
    label: "Team & Preise",
    description: "Vertrauen schaffen und Angebot vervollständigen",
  },
  {
    key: "builder",
    label: "Website gestalten",
    description: "Theme wählen, Bereiche ordnen und veröffentlichen",
  },
] as const;

const promptKeys = [
  "website_setup_prompt_1",
  "website_setup_prompt_2",
  "website_setup_prompt_3",
] as const;

export type WebsiteSetupState = Awaited<
  ReturnType<typeof findWebsiteSetupState>
>;

export async function findWebsiteSetupState(tenantId: string) {
  const [classes, places, hours, fleet, team, prices, items] =
    await Promise.all([
      db
        .select({ id: licenseClasses.id })
        .from(licenseClasses)
        .where(
          and(
            eq(licenseClasses.tenantId, tenantId),
            eq(licenseClasses.active, true),
          ),
        ),
      db
        .select()
        .from(locations)
        .where(
          and(eq(locations.tenantId, tenantId), eq(locations.active, true)),
        )
        .orderBy(asc(locations.position)),
      db
        .select()
        .from(openingHours)
        .where(eq(openingHours.tenantId, tenantId))
        .orderBy(asc(openingHours.weekday)),
      db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.active, true))),
      db
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(
          and(eq(teamMembers.tenantId, tenantId), eq(teamMembers.active, true)),
        ),
      db
        .select({ id: priceGroups.id })
        .from(priceGroups)
        .where(
          and(eq(priceGroups.tenantId, tenantId), eq(priceGroups.active, true)),
        ),
      db
        .select({ key: onboardingItems.key })
        .from(onboardingItems)
        .where(eq(onboardingItems.tenantId, tenantId)),
    ]);
  const keys = new Set(items.map((item) => item.key));
  const completed = {
    classes: classes.length > 0,
    location: places.length > 0 && hours.length > 0,
    vehicles: fleet.length > 0,
    details: team.length > 0 && prices.length > 0,
    builder: keys.has("website_setup_builder_started"),
  };
  const completedCount = websiteSetupSteps.filter(
    (step) => completed[step.key],
  ).length;
  return {
    completed,
    completedCount,
    totalCount: websiteSetupSteps.length,
    percent: Math.round((completedCount / websiteSetupSteps.length) * 100),
    complete: completedCount === websiteSetupSteps.length,
    counts: {
      classes: classes.length,
      locations: places.length,
      vehicles: fleet.length,
      team: team.length,
      prices: prices.length,
    },
    showReminder:
      !keys.has("website_setup_prompt_dismissed") &&
      !keys.has("website_setup_builder_started") &&
      promptKeys.filter((key) => keys.has(key)).length < promptKeys.length,
    reminderViews: promptKeys.filter((key) => keys.has(key)).length,
    location: places[0] ?? null,
    openingHours: hours,
  };
}

export async function markWebsiteSetupItem(input: {
  tenantId: string;
  userId: string;
  key: string;
  label: string;
}) {
  await db
    .insert(onboardingItems)
    .values({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      key: input.key,
      label: input.label,
      completedAt: new Date(),
      completedByUserId: input.userId,
    })
    .onDuplicateKeyUpdate({
      set: { completedAt: new Date(), completedByUserId: input.userId },
    });
}

export async function recordWebsiteSetupReminder(input: {
  tenantId: string;
  userId: string;
}) {
  const state = await findWebsiteSetupState(input.tenantId);
  if (!state.showReminder) return;
  const number = Math.min(state.reminderViews + 1, 3);
  await markWebsiteSetupItem({
    ...input,
    key: `website_setup_prompt_${number}`,
    label: `Einrichtungsassistent Hinweis ${number}`,
  });
}
