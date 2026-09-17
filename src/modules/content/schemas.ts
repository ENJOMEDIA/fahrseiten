import { z } from "zod";

const baseItem = z.object({
  id: z.string().min(1),
  position: z.number().int().min(0),
  active: z.boolean(),
});
export const moneySchema = z
  .string()
  .regex(/^\d{1,8}\.\d{2}$/, "Geldbeträge benötigen zwei Dezimalstellen.");
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const licenseClassSchema = baseItem.extend({
  key: z.string().min(1).max(30),
  title: z.string().min(1).max(120),
  description: z.string().max(2_000),
  minimumAge: z.number().int().min(14).max(99).optional(),
});
export const priceGroupSchema = baseItem.extend({
  title: z.string().min(1).max(140),
  items: z
    .array(
      baseItem.extend({
        label: z.string().min(1).max(180),
        amount: moneySchema,
        currency: z.literal("EUR"),
        unit: z.string().max(80).optional(),
      }),
    )
    .max(50),
});
export const courseSchema = baseItem.extend({
  title: z.string().min(1).max(160),
  description: z.string().max(2_000),
  dates: z
    .array(
      z.object({
        id: z.string().min(1),
        startsAt: z.iso.datetime({ offset: true }),
        endsAt: z.iso.datetime({ offset: true }),
        timezone: z.string().min(1).max(64),
      }),
    )
    .max(50),
});
export const teamMemberSchema = baseItem.extend({
  name: z.string().min(1).max(160),
  role: z.string().min(1).max(120),
  bio: z.string().max(2_000),
  qualifications: z.array(z.string().min(1).max(100)).max(20),
});
export const vehicleSchema = baseItem.extend({
  name: z.string().min(1).max(160),
  category: z.string().min(1).max(80),
  transmission: z.enum(["manual", "automatic"]),
  description: z.string().max(1_000),
});
export const locationSchema = baseItem.extend({
  name: z.string().min(1).max(160),
  street: z.string().min(1).max(180),
  postalCode: z.string().min(1).max(20),
  city: z.string().min(1).max(120),
  phone: z.string().max(40).optional(),
  email: z.email().optional(),
  openingHours: z
    .array(
      z.object({
        weekday: z.number().int().min(1).max(7),
        opensAt: timeSchema.optional(),
        closesAt: timeSchema.optional(),
        closed: z.boolean(),
      }),
    )
    .max(7),
});
export const testimonialSchema = baseItem.extend({
  displayName: z.string().min(1).max(100),
  quote: z.string().min(1).max(1_500),
  rating: z.number().int().min(1).max(5).optional(),
  sourceLabel: z.string().max(100).optional(),
});

export function assertTenantRows<T extends { tenantId: string }>(
  tenantId: string,
  rows: readonly T[],
): T[] {
  if (rows.some((row) => row.tenantId !== tenantId))
    throw new Error("Tenantübergreifende Inhaltsdaten wurden abgewiesen.");
  return [...rows];
}
