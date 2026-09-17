CREATE TABLE `onboarding_items` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`key` varchar(100) NOT NULL,
	`label` varchar(180) NOT NULL,
	`completed_at` timestamp(3),
	`completed_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboarding_items_tenant_key_unique` UNIQUE(`tenant_id`,`key`)
);
--> statement-breakpoint
CREATE TABLE `platform_tasks` (
	`id` varchar(36) NOT NULL,
	`lead_id` varchar(36),
	`tenant_id` varchar(36),
	`assigned_user_id` varchar(36),
	`title` varchar(180) NOT NULL,
	`due_at` timestamp(3),
	`completed_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_activities` (
	`id` varchar(36) NOT NULL,
	`lead_id` varchar(36) NOT NULL,
	`actor_user_id` varchar(36),
	`activity_type` varchar(80) NOT NULL,
	`note` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_leads` (
	`id` varchar(36) NOT NULL,
	`company_name` varchar(180) NOT NULL,
	`contact_name` varchar(160),
	`email` varchar(254),
	`phone` varchar(40),
	`website` varchar(500),
	`source` varchar(100),
	`status` enum('new','contacted','interested','demo','offer','won','lost') NOT NULL DEFAULT 'new',
	`owner_user_id` varchar(36),
	`next_task_at` timestamp(3),
	`loss_reason` text,
	`converted_tenant_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_internal_notes` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`author_user_id` varchar(36),
	`note` text NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_internal_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `onboarding_items` ADD CONSTRAINT `onboarding_items_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboarding_items` ADD CONSTRAINT `onboarding_items_completed_by_user_id_users_id_fk` FOREIGN KEY (`completed_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_tasks` ADD CONSTRAINT `platform_tasks_lead_id_sales_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `sales_leads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_tasks` ADD CONSTRAINT `platform_tasks_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_tasks` ADD CONSTRAINT `platform_tasks_assigned_user_id_users_id_fk` FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_activities` ADD CONSTRAINT `sales_activities_lead_id_sales_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `sales_leads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_activities` ADD CONSTRAINT `sales_activities_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_leads` ADD CONSTRAINT `sales_leads_owner_user_id_users_id_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_leads` ADD CONSTRAINT `sales_leads_converted_tenant_id_tenants_id_fk` FOREIGN KEY (`converted_tenant_id`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_internal_notes` ADD CONSTRAINT `tenant_internal_notes_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_internal_notes` ADD CONSTRAINT `tenant_internal_notes_author_user_id_users_id_fk` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `platform_tasks_assignee_due_idx` ON `platform_tasks` (`assigned_user_id`,`due_at`);--> statement-breakpoint
CREATE INDEX `sales_activities_lead_idx` ON `sales_activities` (`lead_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sales_leads_status_task_idx` ON `sales_leads` (`status`,`next_task_at`);--> statement-breakpoint
CREATE INDEX `tenant_internal_notes_tenant_idx` ON `tenant_internal_notes` (`tenant_id`,`created_at`);