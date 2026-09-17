import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_BASE_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z
    .url()
    .default(
      "mysql://fahrseiten_local:local_only@127.0.0.1:3306/fahrseiten_local",
    ),
  TRUST_PROXY_HEADERS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  MARKETING_HOSTS: z
    .string()
    .default("localhost,127.0.0.1,fahrseiten.de,www.fahrseiten.de"),
  APP_HOSTS: z.string().default("app.localhost,app.fahrseiten.de"),
  DEMO_HOSTS: z
    .string()
    .default("demo.localhost,demo.fahrseiten.de,demo.fahrseiten.local"),
  DEMO_DATA_MODE: z.enum(["fixture", "database"]).default("fixture"),
  SMTP_MODE: z.enum(["catch", "smtp"]).default("catch"),
  SMTP_HOST: z.string().min(1).default("localhost"),
  SMTP_PORT: z.coerce.number().int().min(1).max(65_535).default(1025),
  SMTP_SECURE: booleanFromString.default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z
    .string()
    .min(3)
    .default("FahrSeiten Lokal <noreply@fahrseiten.local>"),
  CRON_SECRET: z.string().min(24).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined>,
): ServerEnv {
  return serverEnvSchema.parse(source);
}
