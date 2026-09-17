import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

const id = (name: string) => varchar(name, { length: 36 });
const timestamps = {
  createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const tenantStatusValues = ["active", "inactive", "suspended"] as const;
export const platformRoleValues = [
  "platform_owner",
  "platform_sales",
  "platform_support",
] as const;
export const tenantRoleValues = [
  "tenant_owner",
  "tenant_editor",
  "tenant_viewer",
] as const;
export const domainStatusValues = [
  "pending",
  "verification_required",
  "verified",
  "active",
  "error",
  "disabled",
] as const;
export const featureStatusValues = [
  "unavailable",
  "coming_soon",
  "beta",
  "enabled",
] as const;
export const pageStatusValues = ["draft", "published", "archived"] as const;

export const tenants = mysqlTable(
  "tenants",
  {
    id: id("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    status: mysqlEnum("status", tenantStatusValues).default("active").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("tenants_slug_unique").on(table.slug)],
);

export const users = mysqlTable(
  "users",
  {
    id: id("id").primaryKey(),
    email: varchar("email", { length: 254 }).notNull(),
    displayName: varchar("display_name", { length: 160 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    platformRole: mysqlEnum("platform_role", platformRoleValues),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const platformSettings = mysqlTable("platform_settings", {
  id: id("id").primaryKey(),
  brandName: varchar("brand_name", { length: 160 }).notNull(),
  companyName: varchar("company_name", { length: 160 }).notNull(),
  ownerName: varchar("owner_name", { length: 160 }).notNull(),
  contactEmail: varchar("contact_email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  street: varchar("street", { length: 180 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  primaryColor: varchar("primary_color", { length: 7 }).notNull(),
  accentColor: varchar("accent_color", { length: 7 }).notNull(),
  logoMediaId: id("logo_media_id"),
  faviconMediaId: id("favicon_media_id"),
  maintenanceMode: boolean("maintenance_mode").default(true).notNull(),
  maintenanceMessage: varchar("maintenance_message", { length: 500 })
    .default(
      "Hier entsteht die neue FahrSeiten-Plattform für moderne Fahrschulen.",
    )
    .notNull(),
  setupCompletedAt: timestamp("setup_completed_at", {
    mode: "date",
    fsp: 3,
  }).notNull(),
  ...timestamps,
});

export const tenantOnboardingTokens = mysqlTable(
  "tenant_onboarding_tokens",
  {
    id: id("id").primaryKey(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    createdByUserId: id("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    expiresAt: timestamp("expires_at", { mode: "date", fsp: 3 }).notNull(),
    usedAt: timestamp("used_at", { mode: "date", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("tenant_onboarding_tokens_hash_unique").on(table.tokenHash),
    index("tenant_onboarding_tokens_expiry_idx").on(table.expiresAt),
  ],
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: id("id").primaryKey(),
    userId: id("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", fsp: 3 }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
    index("sessions_expiry_idx").on(table.expiresAt),
  ],
);

export const passwordResetTokens = mysqlTable(
  "password_reset_tokens",
  {
    id: id("id").primaryKey(),
    userId: id("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", fsp: 3 }).notNull(),
    usedAt: timestamp("used_at", { mode: "date", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("password_reset_token_hash_unique").on(table.tokenHash),
    index("password_reset_user_idx").on(table.userId),
    index("password_reset_expiry_idx").on(table.expiresAt),
  ],
);

export const authRateLimits = mysqlTable(
  "auth_rate_limits",
  {
    keyHash: varchar("key_hash", { length: 64 }).primaryKey(),
    action: varchar("action", { length: 40 }).notNull(),
    attempts: int("attempts").default(0).notNull(),
    windowStartedAt: timestamp("window_started_at", {
      mode: "date",
      fsp: 3,
    }).notNull(),
    blockedUntil: timestamp("blocked_until", { mode: "date", fsp: 3 }),
    updatedAt: timestamp("updated_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("auth_rate_limits_action_idx").on(table.action)],
);

export const tenantMemberships = mysqlTable(
  "tenant_memberships",
  {
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: id("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", tenantRoleValues).notNull(),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.userId] }),
    index("tenant_memberships_user_idx").on(table.userId),
  ],
);

export const domains = mysqlTable(
  "domains",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    hostname: varchar("hostname", { length: 253 }).notNull(),
    status: mysqlEnum("status", domainStatusValues)
      .default("pending")
      .notNull(),
    primary: boolean("is_primary").default(false).notNull(),
    redirectToDomainId: id("redirect_to_domain_id"),
    verificationTokenHash: varchar("verification_token_hash", { length: 128 }),
    verifiedAt: timestamp("verified_at", { mode: "date", fsp: 3 }),
    sslStatus: varchar("ssl_status", { length: 40 })
      .default("unknown")
      .notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("domains_hostname_unique").on(table.hostname),
    index("domains_tenant_idx").on(table.tenantId),
  ],
);

export const sites = mysqlTable(
  "sites",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    locale: varchar("locale", { length: 10 }).default("de-DE").notNull(),
    timezone: varchar("timezone", { length: 64 })
      .default("Europe/Berlin")
      .notNull(),
    maintenanceMode: boolean("maintenance_mode").default(true).notNull(),
    maintenanceMessage: varchar("maintenance_message", { length: 500 })
      .default(
        "Unsere neue Website entsteht gerade. Bald findest du hier alle wichtigen Informationen rund um unsere Fahrschule.",
      )
      .notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("sites_tenant_unique").on(table.tenantId)],
);

export const sitePages = mysqlTable(
  "site_pages",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    siteId: id("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    status: mysqlEnum("status", pageStatusValues).default("draft").notNull(),
    publishedVersionId: id("published_version_id"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("site_pages_tenant_slug_unique").on(table.tenantId, table.slug),
    index("site_pages_site_idx").on(table.siteId),
  ],
);

export const pageVersions = mysqlTable(
  "page_versions",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    pageId: id("page_id")
      .notNull()
      .references(() => sitePages.id, { onDelete: "cascade" }),
    version: int("version").notNull(),
    state: mysqlEnum("state", pageStatusValues).default("draft").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    createdByUserId: id("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("page_versions_page_version_unique").on(
      table.pageId,
      table.version,
    ),
    index("page_versions_tenant_idx").on(table.tenantId),
  ],
);

export const pageBlocks = mysqlTable(
  "page_blocks",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    versionId: id("version_id")
      .notNull()
      .references(() => pageVersions.id, { onDelete: "cascade" }),
    blockType: varchar("block_type", { length: 60 }).notNull(),
    schemaVersion: int("schema_version").default(1).notNull(),
    position: int("position").notNull(),
    visible: boolean("visible").default(true).notNull(),
    properties: json("properties").$type<Record<string, unknown>>().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("page_blocks_version_position_unique").on(
      table.versionId,
      table.position,
    ),
    index("page_blocks_tenant_idx").on(table.tenantId),
  ],
);

export const navigationItems = mysqlTable(
  "navigation_items",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    siteId: id("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    pageId: id("page_id").references(() => sitePages.id, {
      onDelete: "cascade",
    }),
    parentId: id("parent_id"),
    label: varchar("label", { length: 100 }).notNull(),
    externalUrl: varchar("external_url", { length: 500 }),
    position: int("position").notNull(),
    visible: boolean("visible").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("navigation_items_site_position_idx").on(
      table.siteId,
      table.position,
    ),
  ],
);

export const themeSettings = mysqlTable(
  "theme_settings",
  {
    tenantId: id("tenant_id")
      .primaryKey()
      .references(() => tenants.id, { onDelete: "cascade" }),
    siteId: id("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    themeKey: varchar("theme_key", { length: 80 })
      .default("calm_cyan")
      .notNull(),
    primaryColor: varchar("primary_color", { length: 7 })
      .default("#0891b2")
      .notNull(),
    accentColor: varchar("accent_color", { length: 7 })
      .default("#0f172a")
      .notNull(),
    fontKey: varchar("font_key", { length: 80 })
      .default("system_sans")
      .notNull(),
    logoMediaId: id("logo_media_id"),
    faviconMediaId: id("favicon_media_id"),
    ...timestamps,
  },
  (table) => [uniqueIndex("theme_settings_site_unique").on(table.siteId)],
);

export const seoSettings = mysqlTable(
  "seo_settings",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    pageId: id("page_id")
      .notNull()
      .references(() => sitePages.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 70 }),
    description: varchar("description", { length: 170 }),
    canonicalPath: varchar("canonical_path", { length: 300 }),
    noIndex: boolean("no_index").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("seo_settings_page_unique").on(table.pageId),
    index("seo_settings_tenant_idx").on(table.tenantId),
  ],
);

const tenantContentColumns = {
  tenantId: id("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  position: int("position").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
};

export const licenseClasses = mysqlTable(
  "license_classes",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    key: varchar("key", { length: 30 }).notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description"),
    minimumAge: int("minimum_age"),
  },
  (table) => [
    uniqueIndex("license_classes_tenant_key_unique").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const priceGroups = mysqlTable(
  "price_groups",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    title: varchar("title", { length: 140 }).notNull(),
    description: text("description"),
  },
  (table) => [
    index("price_groups_tenant_position_idx").on(
      table.tenantId,
      table.position,
    ),
  ],
);

export const priceItems = mysqlTable(
  "price_items",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    priceGroupId: id("price_group_id")
      .notNull()
      .references(() => priceGroups.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 180 }).notNull(),
    description: text("description"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
    unit: varchar("unit", { length: 80 }),
  },
  (table) => [
    index("price_items_tenant_group_idx").on(
      table.tenantId,
      table.priceGroupId,
    ),
  ],
);

export const courses = mysqlTable(
  "courses",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    locationId: id("location_id"),
  },
  (table) => [
    index("courses_tenant_position_idx").on(table.tenantId, table.position),
  ],
);

export const courseDates = mysqlTable(
  "course_dates",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    courseId: id("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { mode: "date", fsp: 3 }).notNull(),
    endsAt: timestamp("ends_at", { mode: "date", fsp: 3 }).notNull(),
    timezone: varchar("timezone", { length: 64 })
      .default("Europe/Berlin")
      .notNull(),
  },
  (table) => [
    index("course_dates_tenant_start_idx").on(table.tenantId, table.startsAt),
  ],
);

export const teamMembers = mysqlTable(
  "team_members",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    name: varchar("name", { length: 160 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    bio: text("bio"),
    qualifications: json("qualifications").$type<string[]>().notNull(),
  },
  (table) => [
    index("team_members_tenant_position_idx").on(
      table.tenantId,
      table.position,
    ),
  ],
);

export const vehicles = mysqlTable(
  "vehicles",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    name: varchar("name", { length: 160 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    transmission: mysqlEnum("transmission", ["manual", "automatic"]).notNull(),
    description: text("description"),
  },
  (table) => [
    index("vehicles_tenant_position_idx").on(table.tenantId, table.position),
  ],
);

export const locations = mysqlTable(
  "locations",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    name: varchar("name", { length: 160 }).notNull(),
    street: varchar("street", { length: 180 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 254 }),
  },
  (table) => [
    index("locations_tenant_position_idx").on(table.tenantId, table.position),
  ],
);

export const openingHours = mysqlTable(
  "opening_hours",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    locationId: id("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    weekday: int("weekday").notNull(),
    opensAt: varchar("opens_at", { length: 5 }),
    closesAt: varchar("closes_at", { length: 5 }),
    closed: boolean("closed").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("opening_hours_location_weekday_unique").on(
      table.locationId,
      table.weekday,
    ),
  ],
);

export const testimonials = mysqlTable(
  "testimonials",
  {
    id: id("id").primaryKey(),
    ...tenantContentColumns,
    displayName: varchar("display_name", { length: 100 }).notNull(),
    quote: text("quote").notNull(),
    rating: int("rating"),
    sourceLabel: varchar("source_label", { length: 100 }),
  },
  (table) => [
    index("testimonials_tenant_position_idx").on(
      table.tenantId,
      table.position,
    ),
  ],
);

export const mediaAssets = mysqlTable(
  "media_assets",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    byteSize: int("byte_size").notNull(),
    width: int("width").notNull(),
    height: int("height").notNull(),
    altText: varchar("alt_text", { length: 300 }).notNull(),
    description: text("description"),
    archivedAt: timestamp("archived_at", { mode: "date", fsp: 3 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
    index("media_assets_tenant_idx").on(table.tenantId),
  ],
);

export const mediaUsages = mysqlTable(
  "media_usages",
  {
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    mediaId: id("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: id("entity_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.mediaId, table.entityType, table.entityId] }),
    index("media_usages_tenant_idx").on(table.tenantId),
  ],
);

export const inquiryStatusValues = [
  "new",
  "in_progress",
  "answered",
  "completed",
  "spam",
] as const;
export const contactForms = mysqlTable(
  "contact_forms",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    privacyTextVersion: varchar("privacy_text_version", {
      length: 80,
    }).notNull(),
    requiredFields: json("required_fields").$type<string[]>().notNull(),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [index("contact_forms_tenant_idx").on(table.tenantId)],
);
export const contactInquiries = mysqlTable(
  "contact_inquiries",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    formId: id("form_id")
      .notNull()
      .references(() => contactForms.id, { onDelete: "restrict" }),
    status: mysqlEnum("status", inquiryStatusValues).default("new").notNull(),
    contactName: varchar("contact_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    licenseInterest: varchar("license_interest", { length: 100 }),
    message: text("message").notNull(),
    source: varchar("source", { length: 100 }).notNull(),
    privacyTextVersion: varchar("privacy_text_version", {
      length: 80,
    }).notNull(),
    assignedUserId: id("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    followUpAt: timestamp("follow_up_at", { mode: "date", fsp: 3 }),
    deletedAt: timestamp("deleted_at", { mode: "date", fsp: 3 }),
    notificationQueuedAt: timestamp("notification_queued_at", {
      mode: "date",
      fsp: 3,
    }),
    ...timestamps,
  },
  (table) => [
    index("contact_inquiries_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
    index("contact_inquiries_follow_up_idx").on(
      table.tenantId,
      table.followUpAt,
    ),
  ],
);
export const contactNotes = mysqlTable(
  "contact_notes",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    inquiryId: id("inquiry_id")
      .notNull()
      .references(() => contactInquiries.id, { onDelete: "cascade" }),
    authorUserId: id("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("contact_notes_tenant_inquiry_idx").on(
      table.tenantId,
      table.inquiryId,
    ),
  ],
);
export const contactStatusHistory = mysqlTable(
  "contact_status_history",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    inquiryId: id("inquiry_id")
      .notNull()
      .references(() => contactInquiries.id, { onDelete: "cascade" }),
    fromStatus: mysqlEnum("from_status", inquiryStatusValues),
    toStatus: mysqlEnum("to_status", inquiryStatusValues).notNull(),
    actorUserId: id("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("contact_status_history_tenant_idx").on(
      table.tenantId,
      table.inquiryId,
    ),
  ],
);

export const leadStatusValues = [
  "new",
  "contacted",
  "interested",
  "demo",
  "offer",
  "won",
  "lost",
] as const;
export const salesLeads = mysqlTable(
  "sales_leads",
  {
    id: id("id").primaryKey(),
    companyName: varchar("company_name", { length: 180 }).notNull(),
    contactName: varchar("contact_name", { length: 160 }),
    email: varchar("email", { length: 254 }),
    phone: varchar("phone", { length: 40 }),
    website: varchar("website", { length: 500 }),
    source: varchar("source", { length: 100 }),
    privacyTextVersion: varchar("privacy_text_version", { length: 80 }),
    status: mysqlEnum("status", leadStatusValues).default("new").notNull(),
    ownerUserId: id("owner_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    nextTaskAt: timestamp("next_task_at", { mode: "date", fsp: 3 }),
    lossReason: text("loss_reason"),
    convertedTenantId: id("converted_tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("sales_leads_status_task_idx").on(table.status, table.nextTaskAt),
  ],
);
export const salesActivities = mysqlTable(
  "sales_activities",
  {
    id: id("id").primaryKey(),
    leadId: id("lead_id")
      .notNull()
      .references(() => salesLeads.id, { onDelete: "cascade" }),
    actorUserId: id("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    activityType: varchar("activity_type", { length: 80 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sales_activities_lead_idx").on(table.leadId, table.createdAt),
  ],
);
export const platformTasks = mysqlTable(
  "platform_tasks",
  {
    id: id("id").primaryKey(),
    leadId: id("lead_id").references(() => salesLeads.id, {
      onDelete: "cascade",
    }),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    assignedUserId: id("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 180 }).notNull(),
    dueAt: timestamp("due_at", { mode: "date", fsp: 3 }),
    completedAt: timestamp("completed_at", { mode: "date", fsp: 3 }),
    ...timestamps,
  },
  (table) => [
    index("platform_tasks_assignee_due_idx").on(
      table.assignedUserId,
      table.dueAt,
    ),
  ],
);
export const onboardingItems = mysqlTable(
  "onboarding_items",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 100 }).notNull(),
    label: varchar("label", { length: 180 }).notNull(),
    completedAt: timestamp("completed_at", { mode: "date", fsp: 3 }),
    completedByUserId: id("completed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("onboarding_items_tenant_key_unique").on(
      table.tenantId,
      table.key,
    ),
  ],
);
export const tenantInternalNotes = mysqlTable(
  "tenant_internal_notes",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    authorUserId: id("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tenant_internal_notes_tenant_idx").on(
      table.tenantId,
      table.createdAt,
    ),
  ],
);

export const jobStatusValues = [
  "pending",
  "running",
  "retry",
  "completed",
  "failed",
] as const;
export const notificationTemplates = mysqlTable(
  "notification_templates",
  {
    id: id("id").primaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    version: int("version").notNull(),
    subjectTemplate: varchar("subject_template", { length: 240 }).notNull(),
    textTemplate: text("text_template").notNull(),
    htmlTemplate: text("html_template").notNull(),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("notification_templates_key_version_unique").on(
      table.key,
      table.version,
    ),
  ],
);
export const backgroundJobs = mysqlTable(
  "background_jobs",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    type: varchar("type", { length: 100 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 190 }).notNull(),
    payload: json("payload").$type<Record<string, unknown>>().notNull(),
    status: mysqlEnum("status", jobStatusValues).default("pending").notNull(),
    attempts: int("attempts").default(0).notNull(),
    maxAttempts: int("max_attempts").default(4).notNull(),
    runAt: timestamp("run_at", { mode: "date", fsp: 3 }).defaultNow().notNull(),
    lockedAt: timestamp("locked_at", { mode: "date", fsp: 3 }),
    completedAt: timestamp("completed_at", { mode: "date", fsp: 3 }),
    lastErrorCode: varchar("last_error_code", { length: 80 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("background_jobs_idempotency_unique").on(table.idempotencyKey),
    index("background_jobs_due_idx").on(table.status, table.runAt),
  ],
);
export const notificationDeliveries = mysqlTable(
  "notification_deliveries",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    jobId: id("job_id")
      .notNull()
      .references(() => backgroundJobs.id, { onDelete: "cascade" }),
    idempotencyKey: varchar("idempotency_key", { length: 190 }).notNull(),
    channel: mysqlEnum("channel", ["email"]).notNull(),
    templateKey: varchar("template_key", { length: 100 }).notNull(),
    templateVersion: int("template_version").notNull(),
    recipientHash: varchar("recipient_hash", { length: 64 }).notNull(),
    status: mysqlEnum("status", ["reserved", "sent", "failed"])
      .default("reserved")
      .notNull(),
    sentAt: timestamp("sent_at", { mode: "date", fsp: 3 }),
    errorCode: varchar("error_code", { length: 80 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("notification_deliveries_idempotency_unique").on(
      table.idempotencyKey,
    ),
    index("notification_deliveries_job_idx").on(table.jobId),
  ],
);

export const plans = mysqlTable(
  "plans",
  {
    id: id("id").primaryKey(),
    key: varchar("key", { length: 80 }).notNull(),
    internalName: varchar("internal_name", { length: 120 }).notNull(),
    publicName: varchar("public_name", { length: 120 })
      .default("Paket")
      .notNull(),
    description: text("description"),
    monthlyPriceCents: int("monthly_price_cents"),
    setupPriceCents: int("setup_price_cents"),
    position: int("position").default(0).notNull(),
    highlighted: boolean("highlighted").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("plans_key_unique").on(table.key)],
);

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planId: id("plan_id")
      .notNull()
      .references(() => plans.id),
    status: varchar("status", { length: 40 }).default("active").notNull(),
    startsAt: timestamp("starts_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
    endsAt: timestamp("ends_at", { mode: "date", fsp: 3 }),
    ...timestamps,
  },
  (table) => [index("subscriptions_tenant_idx").on(table.tenantId)],
);

export const featureFlags = mysqlTable(
  "feature_flags",
  {
    id: id("id").primaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    addonAvailable: boolean("addon_available").default(false).notNull(),
    addonPriceCents: int("addon_price_cents"),
    defaultStatus: mysqlEnum("default_status", featureStatusValues)
      .default("unavailable")
      .notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("feature_flags_key_unique").on(table.key)],
);

export const planFeatures = mysqlTable(
  "plan_features",
  {
    planId: id("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    featureId: id("feature_id")
      .notNull()
      .references(() => featureFlags.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", featureStatusValues).notNull(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.planId, table.featureId] })],
);

export const tenantFeatures = mysqlTable(
  "tenant_features",
  {
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    featureId: id("feature_id")
      .notNull()
      .references(() => featureFlags.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", featureStatusValues).notNull(),
    reason: varchar("reason", { length: 255 }),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.featureId] })],
);

export const legalDocumentScopeValues = ["platform", "tenant"] as const;
export const legalDocumentTypeValues = ["imprint", "privacy"] as const;
export const legalDocumentStatusValues = [
  "draft",
  "published",
  "archived",
] as const;

export type LegalProfileData = {
  companyName: string;
  legalForm: "individual" | "gbr" | "ug" | "gmbh" | "other";
  representativeName: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  registerType:
    "none" | "commercial" | "partnership" | "cooperative" | "association";
  registerCourt: string;
  registerNumber: string;
  vatId: string;
  regulatedActivity: boolean;
  supervisoryAuthority: string;
  journalisticContent: boolean;
  editorialResponsible: string;
  privacyContactEmail: string;
  dataProtectionOfficerRequired: boolean;
  dataProtectionOfficerEmail: string;
  hostingProvider: string;
  inquiryRetentionMonths: 3 | 6 | 12 | 24;
};

export type LegalModuleSettings = {
  contactForm: boolean;
  emailDelivery: boolean;
  consentManagement: boolean;
  maps: boolean;
  analytics: boolean;
  marketing: boolean;
  video: boolean;
  messaging: boolean;
  onlineBooking: boolean;
  payments: boolean;
};

export const legalProfiles = mysqlTable(
  "legal_profiles",
  {
    profileKey: varchar("profile_key", { length: 36 }).primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    scope: mysqlEnum("scope", legalDocumentScopeValues).notNull(),
    data: json("data").$type<LegalProfileData>().notNull(),
    modules: json("modules").$type<LegalModuleSettings>().notNull(),
    updatedByUserId: id("updated_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("legal_profiles_tenant_unique").on(table.tenantId),
    index("legal_profiles_scope_idx").on(table.scope),
  ],
);

export const legalDocuments = mysqlTable(
  "legal_documents",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    scope: mysqlEnum("scope", legalDocumentScopeValues).notNull(),
    documentType: mysqlEnum("document_type", legalDocumentTypeValues).notNull(),
    version: int("version").notNull(),
    status: mysqlEnum("status", legalDocumentStatusValues)
      .default("draft")
      .notNull(),
    content: text("content").notNull(),
    warningAcknowledgedAt: timestamp("warning_acknowledged_at", {
      mode: "date",
      fsp: 3,
    }),
    effectiveAt: timestamp("effective_at", { mode: "date", fsp: 3 }),
    publishedAt: timestamp("published_at", { mode: "date", fsp: 3 }),
    createdByUserId: id("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("legal_documents_scope_version_unique").on(
      table.scope,
      table.tenantId,
      table.documentType,
      table.version,
    ),
    index("legal_documents_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

export type ConsentChoices = {
  necessary: true;
  functional: boolean;
  statistics: boolean;
  marketing: boolean;
};
export const consentRecords = mysqlTable(
  "consent_records",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    subjectHash: varchar("subject_hash", { length: 64 }).notNull(),
    noticeVersion: varchar("notice_version", { length: 80 }).notNull(),
    choices: json("choices").$type<ConsentChoices>().notNull(),
    sourceHost: varchar("source_host", { length: 253 }).notNull(),
    withdrawnAt: timestamp("withdrawn_at", { mode: "date", fsp: 3 }),
    expiresAt: timestamp("expires_at", { mode: "date", fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("consent_records_subject_idx").on(table.subjectHash, table.createdAt),
    index("consent_records_expiry_idx").on(table.expiresAt),
  ],
);

export const privacyRequestTypeValues = ["export", "deletion"] as const;
export const privacyRequestStatusValues = [
  "received",
  "identity_check",
  "processing",
  "completed",
  "rejected",
] as const;
export const privacyRequests = mysqlTable(
  "privacy_requests",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    requestType: mysqlEnum("request_type", privacyRequestTypeValues).notNull(),
    status: mysqlEnum("status", privacyRequestStatusValues)
      .default("received")
      .notNull(),
    requesterEmailHash: varchar("requester_email_hash", {
      length: 64,
    }).notNull(),
    dueAt: timestamp("due_at", { mode: "date", fsp: 3 }),
    completedAt: timestamp("completed_at", { mode: "date", fsp: 3 }),
    ...timestamps,
  },
  (table) => [
    index("privacy_requests_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
  ],
);

export const retentionPolicies = mysqlTable(
  "retention_policies",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    dataCategory: varchar("data_category", { length: 100 }).notNull(),
    retentionDays: int("retention_days").notNull(),
    legalBasis: varchar("legal_basis", { length: 255 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("retention_policies_tenant_category_unique").on(
      table.tenantId,
      table.dataCategory,
    ),
  ],
);

export const subprocessors = mysqlTable(
  "subprocessors",
  {
    id: id("id").primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    purpose: text("purpose").notNull(),
    country: varchar("country", { length: 100 }),
    privacyUrl: varchar("privacy_url", { length: 500 }),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("subprocessors_name_unique").on(table.name)],
);

export const errorReportStatusValues = [
  "new",
  "triaged",
  "resolved",
  "closed",
] as const;
export const errorReports = mysqlTable(
  "error_reports",
  {
    id: id("id").primaryKey(),
    referenceId: varchar("reference_id", { length: 40 }).notNull(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    reporterUserId: id("reporter_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    surface: varchar("surface", { length: 40 }).notNull(),
    summary: varchar("summary", { length: 180 }).notNull(),
    description: text("description").notNull(),
    status: mysqlEnum("status", errorReportStatusValues)
      .default("new")
      .notNull(),
    resolvedAt: timestamp("resolved_at", { mode: "date", fsp: 3 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("error_reports_reference_unique").on(table.referenceId),
    index("error_reports_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

export const supportTicketStatusValues = [
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;
export const supportTicketPriorityValues = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;
export const supportTickets = mysqlTable(
  "support_tickets",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    createdByUserId: id("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedUserId: id("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    subject: varchar("subject", { length: 180 }).notNull(),
    status: mysqlEnum("status", supportTicketStatusValues)
      .default("open")
      .notNull(),
    priority: mysqlEnum("priority", supportTicketPriorityValues)
      .default("normal")
      .notNull(),
    lastActivityAt: timestamp("last_activity_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index("support_tickets_tenant_status_idx").on(table.tenantId, table.status),
    index("support_tickets_priority_activity_idx").on(
      table.priority,
      table.lastActivityAt,
    ),
  ],
);

export const supportTicketMessages = mysqlTable(
  "support_ticket_messages",
  {
    id: id("id").primaryKey(),
    ticketId: id("ticket_id")
      .notNull()
      .references(() => supportTickets.id, { onDelete: "cascade" }),
    authorUserId: id("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    internal: boolean("internal").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("support_ticket_messages_ticket_idx").on(
      table.ticketId,
      table.createdAt,
    ),
  ],
);

export const technicalEvents = mysqlTable(
  "technical_events",
  {
    id: id("id").primaryKey(),
    referenceId: varchar("reference_id", { length: 40 }).notNull(),
    level: mysqlEnum("level", ["info", "warning", "error"]).notNull(),
    event: varchar("event", { length: 120 }).notNull(),
    context:
      json("context").$type<Record<string, string | number | boolean | null>>(),
    resolvedAt: timestamp("resolved_at", { mode: "date", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("technical_events_level_created_idx").on(
      table.level,
      table.createdAt,
    ),
    index("technical_events_reference_idx").on(table.referenceId),
  ],
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: id("id").primaryKey(),
    tenantId: id("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    actorUserId: id("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }),
    metadata:
      json("metadata").$type<
        Record<string, string | number | boolean | null>
      >(),
    createdAt: timestamp("created_at", { mode: "date", fsp: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_tenant_created_idx").on(table.tenantId, table.createdAt),
    index("audit_logs_actor_idx").on(table.actorUserId),
    index("audit_logs_action_idx").on(table.action),
  ],
);

export const tenantRelations = relations(tenants, ({ many, one }) => ({
  memberships: many(tenantMemberships),
  domains: many(domains),
  site: one(sites),
  subscriptions: many(subscriptions),
  features: many(tenantFeatures),
}));

export const userRelations = relations(users, ({ many }) => ({
  memberships: many(tenantMemberships),
}));

export const membershipRelations = relations(tenantMemberships, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantMemberships.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantMemberships.userId],
    references: [users.id],
  }),
}));

export const domainRelations = relations(domains, ({ one }) => ({
  tenant: one(tenants, {
    fields: [domains.tenantId],
    references: [tenants.id],
  }),
}));

export const schemaVersion = sql`1`;
