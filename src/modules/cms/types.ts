import type { StoredBlock } from "./block-schema";

export type PublishedPage = {
  tenantId: string;
  slug: string;
  title: string;
  version: number;
  blocks: StoredBlock[];
  seo: {
    title?: string;
    description?: string;
    canonicalPath?: string;
    noIndex: boolean;
  };
};

export type SiteNavigationItem = {
  id: string;
  label: string;
  href: string;
  position: number;
};

export type TenantWebsite = {
  tenantId: string;
  name: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  basePath?: string;
  navigation: SiteNavigationItem[];
  theme: {
    primaryColor: string;
    accentColor: string;
    logoUrl?: string;
  };
};
