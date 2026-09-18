CREATE TABLE `billing_profiles` (
	`tenant_id` varchar(36) NOT NULL,
	`use_location_address` boolean NOT NULL DEFAULT true,
	`company_name` varchar(180) NOT NULL,
	`recipient_name` varchar(160),
	`email` varchar(254) NOT NULL,
	`street` varchar(180) NOT NULL,
	`postal_code` varchar(20) NOT NULL,
	`city` varchar(120) NOT NULL,
	`country` varchar(120) NOT NULL DEFAULT 'Deutschland',
	`vat_id` varchar(40),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_profiles_tenant_id` PRIMARY KEY(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_records` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`subscription_id` varchar(36),
	`customer_number_snapshot` varchar(32) NOT NULL,
	`invoice_number` varchar(80) NOT NULL,
	`external_provider` varchar(40) NOT NULL DEFAULT 'accountable',
	`external_reference` varchar(160),
	`issued_at` timestamp(3) NOT NULL,
	`due_at` timestamp(3) NOT NULL,
	`gross_amount_cents` int NOT NULL,
	`status` enum('open','paid','overdue','cancelled') NOT NULL DEFAULT 'open',
	`paid_at` timestamp(3),
	`storage_key` varchar(500) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`byte_size` int NOT NULL,
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoice_records_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `billing_interval_months` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `minimum_term_months` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `next_invoice_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `billing_profiles` ADD CONSTRAINT `billing_profiles_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_records` ADD CONSTRAINT `invoice_records_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_records` ADD CONSTRAINT `invoice_records_subscription_id_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_records` ADD CONSTRAINT `invoice_records_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `invoice_records_tenant_due_idx` ON `invoice_records` (`tenant_id`,`due_at`);