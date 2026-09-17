CREATE TABLE `contact_forms` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`privacy_text_version` varchar(80) NOT NULL,
	`required_fields` json NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_inquiries` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`form_id` varchar(36) NOT NULL,
	`status` enum('new','in_progress','answered','completed','spam') NOT NULL DEFAULT 'new',
	`contact_name` varchar(160) NOT NULL,
	`email` varchar(254) NOT NULL,
	`phone` varchar(40),
	`license_interest` varchar(100),
	`message` text NOT NULL,
	`source` varchar(100) NOT NULL,
	`privacy_text_version` varchar(80) NOT NULL,
	`assigned_user_id` varchar(36),
	`follow_up_at` timestamp(3),
	`deleted_at` timestamp(3),
	`notification_queued_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_notes` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`inquiry_id` varchar(36) NOT NULL,
	`author_user_id` varchar(36),
	`note` text NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_status_history` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`inquiry_id` varchar(36) NOT NULL,
	`from_status` enum('new','in_progress','answered','completed','spam'),
	`to_status` enum('new','in_progress','answered','completed','spam') NOT NULL,
	`actor_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contact_forms` ADD CONSTRAINT `contact_forms_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD CONSTRAINT `contact_inquiries_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD CONSTRAINT `contact_inquiries_form_id_contact_forms_id_fk` FOREIGN KEY (`form_id`) REFERENCES `contact_forms`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD CONSTRAINT `contact_inquiries_assigned_user_id_users_id_fk` FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_notes` ADD CONSTRAINT `contact_notes_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_notes` ADD CONSTRAINT `contact_notes_inquiry_id_contact_inquiries_id_fk` FOREIGN KEY (`inquiry_id`) REFERENCES `contact_inquiries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_notes` ADD CONSTRAINT `contact_notes_author_user_id_users_id_fk` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_status_history` ADD CONSTRAINT `contact_status_history_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_status_history` ADD CONSTRAINT `contact_status_history_inquiry_id_contact_inquiries_id_fk` FOREIGN KEY (`inquiry_id`) REFERENCES `contact_inquiries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_status_history` ADD CONSTRAINT `contact_status_history_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contact_forms_tenant_idx` ON `contact_forms` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `contact_inquiries_tenant_status_idx` ON `contact_inquiries` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `contact_inquiries_follow_up_idx` ON `contact_inquiries` (`tenant_id`,`follow_up_at`);--> statement-breakpoint
CREATE INDEX `contact_notes_tenant_inquiry_idx` ON `contact_notes` (`tenant_id`,`inquiry_id`);--> statement-breakpoint
CREATE INDEX `contact_status_history_tenant_idx` ON `contact_status_history` (`tenant_id`,`inquiry_id`);