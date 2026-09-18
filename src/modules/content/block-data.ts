import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  courseDates,
  courses,
  licenseClasses,
  locations,
  openingHours,
  priceGroups,
  priceItems,
  teamMembers,
  testimonials,
  vehicles,
} from "@/db/schema";
import type { StoredBlock } from "@/modules/cms/block-schema";
import { mediaPublicUrl } from "@/modules/media/public-url";

export async function hydrateTenantContentBlocks(
  tenantId: string,
  blocks: StoredBlock[],
): Promise<StoredBlock[]> {
  const types = new Set(blocks.map((block) => block.properties.type));
  const [
    classes,
    groups,
    prices,
    courseRows,
    dates,
    team,
    fleet,
    places,
    hours,
    reviews,
  ] = await Promise.all([
    types.has("license_classes")
      ? db
          .select()
          .from(licenseClasses)
          .where(eq(licenseClasses.tenantId, tenantId))
          .orderBy(asc(licenseClasses.position))
      : [],
    types.has("prices")
      ? db
          .select()
          .from(priceGroups)
          .where(eq(priceGroups.tenantId, tenantId))
          .orderBy(asc(priceGroups.position))
      : [],
    types.has("prices")
      ? db
          .select()
          .from(priceItems)
          .where(eq(priceItems.tenantId, tenantId))
          .orderBy(asc(priceItems.position))
      : [],
    types.has("courses")
      ? db
          .select()
          .from(courses)
          .where(eq(courses.tenantId, tenantId))
          .orderBy(asc(courses.position))
      : [],
    types.has("courses")
      ? db
          .select()
          .from(courseDates)
          .where(eq(courseDates.tenantId, tenantId))
          .orderBy(asc(courseDates.position))
      : [],
    types.has("team")
      ? db
          .select()
          .from(teamMembers)
          .where(eq(teamMembers.tenantId, tenantId))
          .orderBy(asc(teamMembers.position))
      : [],
    types.has("fleet")
      ? db
          .select()
          .from(vehicles)
          .where(eq(vehicles.tenantId, tenantId))
          .orderBy(asc(vehicles.position))
      : [],
    types.has("locations")
      ? db
          .select()
          .from(locations)
          .where(eq(locations.tenantId, tenantId))
          .orderBy(asc(locations.position))
      : [],
    types.has("locations")
      ? db
          .select()
          .from(openingHours)
          .where(eq(openingHours.tenantId, tenantId))
          .orderBy(asc(openingHours.weekday))
      : [],
    types.has("testimonials")
      ? db
          .select()
          .from(testimonials)
          .where(eq(testimonials.tenantId, tenantId))
          .orderBy(asc(testimonials.position))
      : [],
  ]);

  return blocks.map((block) => {
    const properties = block.properties;
    switch (properties.type) {
      case "license_classes":
        return {
          ...block,
          properties: {
            ...properties,
            items: classes.map((item) => ({
              id: item.id,
              position: item.position,
              active: item.active,
              key: item.key,
              title: item.title,
              description: item.description ?? "",
              minimumAge: item.minimumAge ?? undefined,
            })),
          },
        };
      case "prices":
        return {
          ...block,
          properties: {
            ...properties,
            groups: groups.map((group) => ({
              id: group.id,
              position: group.position,
              active: group.active,
              title: group.title,
              items: prices
                .filter((item) => item.priceGroupId === group.id)
                .map((item) => ({
                  id: item.id,
                  position: item.position,
                  active: item.active,
                  label: item.label,
                  amount: item.amount,
                  currency: "EUR" as const,
                  unit: item.unit ?? undefined,
                })),
            })),
          },
        };
      case "courses":
        return {
          ...block,
          properties: {
            ...properties,
            items: courseRows.map((course) => ({
              id: course.id,
              position: course.position,
              active: course.active,
              title: course.title,
              description: course.description ?? "",
              dates: dates
                .filter((date) => date.courseId === course.id)
                .map((date) => ({
                  id: date.id,
                  startsAt: date.startsAt.toISOString(),
                  endsAt: date.endsAt.toISOString(),
                  timezone: date.timezone,
                })),
            })),
          },
        };
      case "team":
        return {
          ...block,
          properties: {
            ...properties,
            items: team.map((item) => ({
              id: item.id,
              position: item.position,
              active: item.active,
              name: item.name,
              role: item.role,
              bio: item.bio ?? "",
              qualifications: item.qualifications,
            })),
          },
        };
      case "fleet":
        return {
          ...block,
          properties: {
            ...properties,
            items: fleet.map((item) => ({
              id: item.id,
              position: item.position,
              active: item.active,
              name: item.name,
              category: item.category,
              transmission: item.transmission,
              description: item.description ?? "",
              imageMediaId: item.imageMediaId ?? undefined,
              imageUrl: item.imageMediaId
                ? mediaPublicUrl(item.imageMediaId)
                : undefined,
              imageAlt: item.name,
            })),
          },
        };
      case "locations":
        return {
          ...block,
          properties: {
            ...properties,
            items: places.map((place) => ({
              id: place.id,
              position: place.position,
              active: place.active,
              name: place.name,
              street: place.street,
              postalCode: place.postalCode,
              city: place.city,
              phone: place.phone ?? undefined,
              email: place.email ?? undefined,
              openingHours: hours
                .filter((entry) => entry.locationId === place.id)
                .map((entry) => ({
                  weekday: entry.weekday,
                  opensAt: entry.opensAt ?? undefined,
                  closesAt: entry.closesAt ?? undefined,
                  closed: entry.closed,
                })),
            })),
          },
        };
      case "testimonials":
        return {
          ...block,
          properties: {
            ...properties,
            items: reviews.map((item) => ({
              id: item.id,
              position: item.position,
              active: item.active,
              displayName: item.displayName,
              quote: item.quote,
              rating: item.rating ?? undefined,
              sourceLabel: item.sourceLabel ?? undefined,
            })),
          },
        };
      default:
        return block;
    }
  });
}
