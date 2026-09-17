import { relations, sql } from "drizzle-orm";
import {
  boolean,
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
    ...timestamps,
  },
  (table) => [uniqueIndex("sites_tenant_unique").on(table.tenantId)],
);

export const plans = mysqlTable(
  "plans",
  {
    id: id("id").primaryKey(),
    key: varchar("key", { length: 80 }).notNull(),
    internalName: varchar("internal_name", { length: 120 }).notNull(),
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
