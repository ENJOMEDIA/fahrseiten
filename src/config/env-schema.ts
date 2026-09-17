import { z } from "zod";

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
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined>,
): ServerEnv {
  return serverEnvSchema.parse(source);
}
