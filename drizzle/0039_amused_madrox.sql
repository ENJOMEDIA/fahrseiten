CREATE TABLE `sales_newsletter_campaigns` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`subject_template` varchar(240) NOT NULL,
	`body_template` text NOT NULL,
	`style_key` varchar(40) NOT NULL DEFAULT 'cyan',
	`recipient_count` int NOT NULL,
	`created_by_user_id` varchar(36),
	`queued_at` timestamp(3) NOT NULL DEFAULT (now()),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_newsletter_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_newsletter_recipients` (
	`id` varchar(36) NOT NULL,
	`campaign_id` varchar(36) NOT NULL,
	`lead_id` varchar(36) NOT NULL,
	`job_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_newsletter_recipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_newsletter_campaign_lead_unique` UNIQUE(`campaign_id`,`lead_id`),
	CONSTRAINT `sales_newsletter_job_unique` UNIQUE(`job_id`)
);
--> statement-breakpoint
ALTER TABLE `sales_newsletter_campaigns` ADD CONSTRAINT `sales_newsletter_campaigns_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_newsletter_recipients` ADD CONSTRAINT `sales_newsletter_recipients_campaign_id_sales_newsletter_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `sales_newsletter_campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_newsletter_recipients` ADD CONSTRAINT `sales_newsletter_recipients_lead_id_sales_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `sales_leads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_newsletter_recipients` ADD CONSTRAINT `sales_newsletter_recipients_job_id_background_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `background_jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sales_newsletter_campaigns_queued_idx` ON `sales_newsletter_campaigns` (`queued_at`);--> statement-breakpoint
CREATE INDEX `sales_newsletter_recipients_lead_idx` ON `sales_newsletter_recipients` (`lead_id`);