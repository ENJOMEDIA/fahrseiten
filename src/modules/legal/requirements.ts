import type { LegalModuleSettings } from "@/db/schema";
import type { LegalModuleKey } from "@/modules/features/catalog";

export function findMissingRequiredLegalModules(
  modules: LegalModuleSettings,
  requiredModules: readonly LegalModuleKey[],
) {
  return requiredModules.filter((module) => !modules[module]);
}
