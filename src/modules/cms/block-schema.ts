import { z } from "zod";

import {
  courseSchema,
  licenseClassSchema,
  locationSchema,
  priceGroupSchema,
  teamMemberSchema,
  testimonialSchema,
  vehicleSchema,
} from "@/modules/content/schemas";

const safeLink = z
  .string()
  .max(500)
  .refine(
    (value) => value.startsWith("/") || /^(https:|mailto:|tel:)/.test(value),
    "Unzulässiges Linkziel",
  );
const text = z.string().trim().min(1).max(5_000);

const hero = z.object({
  type: z.literal("hero"),
  eyebrow: z.string().max(100).optional(),
  heading: z.string().min(1).max(160),
  text: z.string().max(600),
  actionLabel: z.string().max(80).optional(),
  actionHref: safeLink.optional(),
});
const textImage = z.object({
  type: z.literal("text_image"),
  heading: z.string().min(1).max(160),
  paragraphs: z.array(text).min(1).max(8),
  mediaId: z.uuid().optional(),
  imageUrl: z.string().max(500).optional(),
  imageAlt: z.string().max(180).default(""),
  imagePosition: z.enum(["left", "right"]).default("right"),
});
const benefits = z.object({
  type: z.literal("benefits"),
  heading: z.string().min(1).max(160),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        text: z.string().max(300),
      }),
    )
    .min(1)
    .max(8),
});
const cta = z.object({
  type: z.literal("cta"),
  heading: z.string().min(1).max(160),
  text: z.string().max(400),
  actionLabel: z.string().min(1).max(80),
  actionHref: safeLink,
});
const faq = z.object({
  type: z.literal("faq"),
  heading: z.string().min(1).max(160),
  items: z
    .array(z.object({ question: z.string().min(1).max(240), answer: text }))
    .min(1)
    .max(30),
});
const contactTeaser = z.object({
  type: z.literal("contact_teaser"),
  heading: z.string().min(1).max(160),
  text: z.string().max(400),
  phone: z.string().max(40).optional(),
  email: z.email().optional(),
});
const licenseClasses = z.object({
  type: z.literal("license_classes"),
  heading: z.string().min(1).max(160),
  items: z.array(licenseClassSchema).max(30),
});
const prices = z.object({
  type: z.literal("prices"),
  heading: z.string().min(1).max(160),
  groups: z.array(priceGroupSchema).max(20),
});
const courses = z.object({
  type: z.literal("courses"),
  heading: z.string().min(1).max(160),
  items: z.array(courseSchema).max(30),
});
const team = z.object({
  type: z.literal("team"),
  heading: z.string().min(1).max(160),
  items: z.array(teamMemberSchema).max(50),
});
const fleet = z.object({
  type: z.literal("fleet"),
  heading: z.string().min(1).max(160),
  items: z.array(vehicleSchema).max(50),
});
const locations = z.object({
  type: z.literal("locations"),
  heading: z.string().min(1).max(160),
  items: z.array(locationSchema).max(20),
});
const testimonials = z.object({
  type: z.literal("testimonials"),
  heading: z.string().min(1).max(160),
  items: z.array(testimonialSchema).max(50),
});

export const blockPropertiesSchema = z.discriminatedUnion("type", [
  hero,
  textImage,
  benefits,
  cta,
  faq,
  contactTeaser,
  licenseClasses,
  prices,
  courses,
  team,
  fleet,
  locations,
  testimonials,
]);
export type BlockProperties = z.infer<typeof blockPropertiesSchema>;

export const storedBlockSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.literal(1),
  position: z.number().int().min(0),
  visible: z.boolean(),
  properties: blockPropertiesSchema,
});
export type StoredBlock = z.infer<typeof storedBlockSchema>;

export function parseStoredBlocks(blocks: unknown): StoredBlock[] {
  const parsed = z.array(storedBlockSchema).max(80).parse(blocks);
  const positions = new Set(parsed.map((block) => block.position));
  if (positions.size !== parsed.length)
    throw new Error("Blockpositionen müssen eindeutig sein.");
  return [...parsed].sort((a, b) => a.position - b.position);
}
