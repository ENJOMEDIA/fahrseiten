CREATE TABLE `media_assets` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`storage_key` varchar(500) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`byte_size` int NOT NULL,
	`width` int NOT NULL,
	`height` int NOT NULL,
	`alt_text` varchar(300) NOT NULL,
	`description` text,
	`archived_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_assets_storage_key_unique` UNIQUE(`storage_key`)
);
--> statement-breakpoint
CREATE TABLE `media_usages` (
	`tenant_id` varchar(36) NOT NULL,
	`media_id` varchar(36) NOT NULL,
	`entity_type` varchar(80) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `media_usages_media_id_entity_type_entity_id_pk` PRIMARY KEY(`media_id`,`entity_type`,`entity_id`)
);
--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_usages` ADD CONSTRAINT `media_usages_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_usages` ADD CONSTRAINT `media_usages_media_id_media_assets_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `media_assets_tenant_idx` ON `media_assets` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `media_usages_tenant_idx` ON `media_usages` (`tenant_id`);