CREATE TABLE `navigation_items` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`page_id` varchar(36),
	`parent_id` varchar(36),
	`label` varchar(100) NOT NULL,
	`external_url` varchar(500),
	`position` int NOT NULL,
	`visible` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `navigation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_blocks` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`version_id` varchar(36) NOT NULL,
	`block_type` varchar(60) NOT NULL,
	`schema_version` int NOT NULL DEFAULT 1,
	`position` int NOT NULL,
	`visible` boolean NOT NULL DEFAULT true,
	`properties` json NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `page_blocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_blocks_version_position_unique` UNIQUE(`version_id`,`position`)
);
--> statement-breakpoint
CREATE TABLE `page_versions` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`page_id` varchar(36) NOT NULL,
	`version` int NOT NULL,
	`state` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`title` varchar(180) NOT NULL,
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `page_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_versions_page_version_unique` UNIQUE(`page_id`,`version`)
);
--> statement-breakpoint
CREATE TABLE `seo_settings` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`page_id` varchar(36) NOT NULL,
	`title` varchar(70),
	`description` varchar(170),
	`canonical_path` varchar(300),
	`no_index` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `seo_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `seo_settings_page_unique` UNIQUE(`page_id`)
);
--> statement-breakpoint
CREATE TABLE `site_pages` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(180) NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`published_version_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `site_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_pages_tenant_slug_unique` UNIQUE(`tenant_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `theme_settings` (
	`tenant_id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`theme_key` varchar(80) NOT NULL DEFAULT 'calm_cyan',
	`primary_color` varchar(7) NOT NULL DEFAULT '#0891b2',
	`accent_color` varchar(7) NOT NULL DEFAULT '#0f172a',
	`font_key` varchar(80) NOT NULL DEFAULT 'system_sans',
	`logo_media_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `theme_settings_tenant_id` PRIMARY KEY(`tenant_id`),
	CONSTRAINT `theme_settings_site_unique` UNIQUE(`site_id`)
);
--> statement-breakpoint
ALTER TABLE `navigation_items` ADD CONSTRAINT `navigation_items_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `navigation_items` ADD CONSTRAINT `navigation_items_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `navigation_items` ADD CONSTRAINT `navigation_items_page_id_site_pages_id_fk` FOREIGN KEY (`page_id`) REFERENCES `site_pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `page_blocks` ADD CONSTRAINT `page_blocks_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `page_blocks` ADD CONSTRAINT `page_blocks_version_id_page_versions_id_fk` FOREIGN KEY (`version_id`) REFERENCES `page_versions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `page_versions` ADD CONSTRAINT `page_versions_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `page_versions` ADD CONSTRAINT `page_versions_page_id_site_pages_id_fk` FOREIGN KEY (`page_id`) REFERENCES `site_pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `page_versions` ADD CONSTRAINT `page_versions_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seo_settings` ADD CONSTRAINT `seo_settings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seo_settings` ADD CONSTRAINT `seo_settings_page_id_site_pages_id_fk` FOREIGN KEY (`page_id`) REFERENCES `site_pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_pages` ADD CONSTRAINT `site_pages_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_pages` ADD CONSTRAINT `site_pages_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `theme_settings` ADD CONSTRAINT `theme_settings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `theme_settings` ADD CONSTRAINT `theme_settings_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `navigation_items_site_position_idx` ON `navigation_items` (`site_id`,`position`);--> statement-breakpoint
CREATE INDEX `page_blocks_tenant_idx` ON `page_blocks` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `page_versions_tenant_idx` ON `page_versions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `seo_settings_tenant_idx` ON `seo_settings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `site_pages_site_idx` ON `site_pages` (`site_id`);