import { z } from "zod";

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

export const blockPropertiesSchema = z.discriminatedUnion("type", [
  hero,
  textImage,
  benefits,
  cta,
  faq,
  contactTeaser,
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
