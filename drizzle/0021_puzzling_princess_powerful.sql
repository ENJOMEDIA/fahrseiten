CREATE TABLE `traffic_hourly` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`scope` enum('platform','tenant','demo') NOT NULL,
	`hostname` varchar(253) NOT NULL,
	`path` varchar(300) NOT NULL,
	`hour` timestamp(0) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_hourly_id` PRIMARY KEY(`id`),
	CONSTRAINT `traffic_hourly_bucket_unique` UNIQUE(`tenant_id`,`scope`,`hostname`,`path`,`hour`)
);
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `optimized_storage_key` varchar(500);--> statement-breakpoint
ALTER TABLE `media_assets` ADD `optimized_byte_size` int;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `crop_aspect` enum('original','16:9','4:3','1:1') DEFAULT 'original' NOT NULL;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `crop_x` int DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `crop_y` int DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `crop_zoom` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `processing_status` enum('original','queued','processing','ready','failed') DEFAULT 'original' NOT NULL;--> statement-breakpoint
ALTER TABLE `traffic_hourly` ADD CONSTRAINT `traffic_hourly_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `traffic_hourly_time_idx` ON `traffic_hourly` (`hour`);--> statement-breakpoint
CREATE INDEX `traffic_hourly_tenant_time_idx` ON `traffic_hourly` (`tenant_id`,`hour`);