CREATE TABLE `platform_settings` (
	`id` varchar(36) NOT NULL,
	`brand_name` varchar(160) NOT NULL,
	`company_name` varchar(160) NOT NULL,
	`owner_name` varchar(160) NOT NULL,
	`contact_email` varchar(254) NOT NULL,
	`phone` varchar(40),
	`street` varchar(180) NOT NULL,
	`postal_code` varchar(20) NOT NULL,
	`city` varchar(120) NOT NULL,
	`primary_color` varchar(7) NOT NULL,
	`accent_color` varchar(7) NOT NULL,
	`setup_completed_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_onboarding_tokens` (
	`id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`created_by_user_id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`used_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_onboarding_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_onboarding_tokens_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
ALTER TABLE `tenant_onboarding_tokens` ADD CONSTRAINT `tenant_onboarding_tokens_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tenant_onboarding_tokens_expiry_idx` ON `tenant_onboarding_tokens` (`expires_at`);