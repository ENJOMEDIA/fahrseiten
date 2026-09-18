CREATE TABLE `postal_dispatches` (
	`id` varchar(36) NOT NULL,
	`lead_id` varchar(36) NOT NULL,
	`provider` varchar(80) NOT NULL DEFAULT 'onlinebrief24',
	`provider_job_id` varchar(80),
	`provider_status` varchar(80),
	`mode` enum('test','live') NOT NULL,
	`status` enum('prepared','submitted','failed') NOT NULL DEFAULT 'prepared',
	`color` boolean NOT NULL DEFAULT true,
	`storage_key` varchar(500) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`byte_size` int NOT NULL,
	`error_code` varchar(160),
	`submitted_at` timestamp(3),
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `postal_dispatches_id` PRIMARY KEY(`id`),
	CONSTRAINT `postal_dispatches_provider_job_unique` UNIQUE(`provider`,`provider_job_id`)
);
--> statement-breakpoint
CREATE TABLE `sales_offers` (
	`id` varchar(36) NOT NULL,
	`lead_id` varchar(36) NOT NULL,
	`offer_number` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`status` enum('draft','sent','accepted','declined','expired') NOT NULL DEFAULT 'draft',
	`valid_until` timestamp(3) NOT NULL,
	`introduction` text,
	`items` json NOT NULL,
	`net_total_cents` int NOT NULL,
	`vat_rate_basis_points` int NOT NULL DEFAULT 1900,
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_offers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_offers_number_unique` UNIQUE(`offer_number`)
);
--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `street` varchar(180);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_code` varchar(20);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `country` varchar(120) DEFAULT 'Deutschland' NOT NULL;--> statement-breakpoint
ALTER TABLE `postal_dispatches` ADD CONSTRAINT `postal_dispatches_lead_id_sales_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `sales_leads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `postal_dispatches` ADD CONSTRAINT `postal_dispatches_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_offers` ADD CONSTRAINT `sales_offers_lead_id_sales_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `sales_leads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_offers` ADD CONSTRAINT `sales_offers_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `postal_dispatches_lead_created_idx` ON `postal_dispatches` (`lead_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sales_offers_lead_created_idx` ON `sales_offers` (`lead_id`,`created_at`);