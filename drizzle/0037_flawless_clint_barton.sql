CREATE TABLE `referral_codes` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`code` varchar(48) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`terms_version` varchar(40) NOT NULL DEFAULT 'recommendation-v1',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_tenant_unique` UNIQUE(`tenant_id`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` varchar(36) NOT NULL,
	`referral_code_id` varchar(36) NOT NULL,
	`referrer_tenant_id` varchar(36) NOT NULL,
	`referred_lead_id` varchar(36) NOT NULL,
	`referred_tenant_id` varchar(36),
	`status` enum('pending','awaiting_eligibility','qualified','credited','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`terms_version` varchar(40) NOT NULL,
	`disclosure_confirmed_at` timestamp(3) NOT NULL,
	`eligible_at` timestamp(3),
	`qualified_at` timestamp(3),
	`reward_cents_snapshot` int,
	`credited_at` timestamp(3),
	`credited_invoice_id` varchar(36),
	`rejected_at` timestamp(3),
	`rejection_reason` varchar(500),
	`reviewed_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_lead_unique` UNIQUE(`referred_lead_id`),
	CONSTRAINT `referrals_tenant_unique` UNIQUE(`referred_tenant_id`)
);
--> statement-breakpoint
ALTER TABLE `plans` ADD `annual_billing_enabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `plans` ADD `annual_discount_basis_points` int DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `billing_amount_cents_snapshot` int;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `discount_basis_points_snapshot` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_codes` ADD CONSTRAINT `referral_codes_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referral_code_id_referral_codes_id_fk` FOREIGN KEY (`referral_code_id`) REFERENCES `referral_codes`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_tenant_id_tenants_id_fk` FOREIGN KEY (`referrer_tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_lead_id_sales_leads_id_fk` FOREIGN KEY (`referred_lead_id`) REFERENCES `sales_leads`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_tenant_id_tenants_id_fk` FOREIGN KEY (`referred_tenant_id`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_credited_invoice_id_invoice_records_id_fk` FOREIGN KEY (`credited_invoice_id`) REFERENCES `invoice_records`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_reviewed_by_user_id_users_id_fk` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `referrals_referrer_status_idx` ON `referrals` (`referrer_tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `referrals_eligible_idx` ON `referrals` (`status`,`eligible_at`);