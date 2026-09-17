CREATE TABLE `sales_email_templates` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`subject_template` varchar(240) NOT NULL,
	`body_template` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vehicles` ADD `image_media_id` varchar(36);--> statement-breakpoint
ALTER TABLE `sales_email_templates` ADD CONSTRAINT `sales_email_templates_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sales_email_templates_active_idx` ON `sales_email_templates` (`active`);--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_image_media_id_media_assets_id_fk` FOREIGN KEY (`image_media_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;