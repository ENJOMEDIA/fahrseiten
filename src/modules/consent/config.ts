import "server-only";

import { env } from "@/config/env";

import type { ConsentCategory } from "./model";

export type OptionalService = {
  category: ConsentCategory;
  label: string;
  services: string;
};

export function getOptionalServiceConfig(): OptionalService[] {
  return [
    {
      category: "functional",
      label: "Funktional",
      services: env.CONSENT_FUNCTIONAL_SERVICES,
    },
    {
      category: "statistics",
      label: "Statistik",
      services: env.CONSENT_STATISTICS_SERVICES,
    },
    {
      category: "marketing",
      label: "Marketing",
      services: env.CONSENT_MARKETING_SERVICES,
    },
  ].filter((entry) => entry.services.trim().length > 0) as OptionalService[];
}
