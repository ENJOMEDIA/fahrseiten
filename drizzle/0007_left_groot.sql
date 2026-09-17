CREATE TABLE `background_jobs` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`type` varchar(100) NOT NULL,
	`idempotency_key` varchar(190) NOT NULL,
	`payload` json NOT NULL,
	`status` enum('pending','running','retry','completed','failed') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`max_attempts` int NOT NULL DEFAULT 4,
	`run_at` timestamp(3) NOT NULL DEFAULT (now()),
	`locked_at` timestamp(3),
	`completed_at` timestamp(3),
	`last_error_code` varchar(80),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `background_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `background_jobs_idempotency_unique` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `notification_deliveries` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`job_id` varchar(36) NOT NULL,
	`idempotency_key` varchar(190) NOT NULL,
	`channel` enum('email') NOT NULL,
	`template_key` varchar(100) NOT NULL,
	`template_version` int NOT NULL,
	`recipient_hash` varchar(64) NOT NULL,
	`status` enum('reserved','sent','failed') NOT NULL DEFAULT 'reserved',
	`sent_at` timestamp(3),
	`error_code` varchar(80),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_deliveries_idempotency_unique` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `notification_templates` (
	`id` varchar(36) NOT NULL,
	`key` varchar(100) NOT NULL,
	`version` int NOT NULL,
	`subject_template` varchar(240) NOT NULL,
	`text_template` text NOT NULL,
	`html_template` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_templates_key_version_unique` UNIQUE(`key`,`version`)
);
--> statement-breakpoint
ALTER TABLE `background_jobs` ADD CONSTRAINT `background_jobs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_deliveries` ADD CONSTRAINT `notification_deliveries_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_deliveries` ADD CONSTRAINT `notification_deliveries_job_id_background_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `background_jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `background_jobs_due_idx` ON `background_jobs` (`status`,`run_at`);--> statement-breakpoint
CREATE INDEX `notification_deliveries_job_idx` ON `notification_deliveries` (`job_id`);