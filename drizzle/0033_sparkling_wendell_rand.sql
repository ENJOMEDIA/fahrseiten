CREATE TABLE `postal_letter_templates` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`headline_template` varchar(180) NOT NULL,
	`body_template` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `postal_letter_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `postal_letter_templates` ADD CONSTRAINT `postal_letter_templates_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `postal_letter_templates_active_idx` ON `postal_letter_templates` (`active`);