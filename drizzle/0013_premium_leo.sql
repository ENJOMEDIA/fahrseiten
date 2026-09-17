CREATE TABLE `legal_profiles` (
	`profile_key` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`scope` enum('platform','tenant') NOT NULL,
	`data` json NOT NULL,
	`modules` json NOT NULL,
	`updated_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_profiles_profile_key` PRIMARY KEY(`profile_key`),
	CONSTRAINT `legal_profiles_tenant_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
ALTER TABLE `legal_profiles` ADD CONSTRAINT `legal_profiles_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `legal_profiles` ADD CONSTRAINT `legal_profiles_updated_by_user_id_users_id_fk` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `legal_profiles_scope_idx` ON `legal_profiles` (`scope`);