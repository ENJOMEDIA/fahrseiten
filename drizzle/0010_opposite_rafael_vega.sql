CREATE TABLE `error_reports` (
	`id` varchar(36) NOT NULL,
	`reference_id` varchar(40) NOT NULL,
	`tenant_id` varchar(36),
	`reporter_user_id` varchar(36),
	`surface` varchar(40) NOT NULL,
	`summary` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`status` enum('new','triaged','resolved','closed') NOT NULL DEFAULT 'new',
	`resolved_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `error_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `error_reports_reference_unique` UNIQUE(`reference_id`)
);
--> statement-breakpoint
CREATE TABLE `support_ticket_messages` (
	`id` varchar(36) NOT NULL,
	`ticket_id` varchar(36) NOT NULL,
	`author_user_id` varchar(36),
	`body` text NOT NULL,
	`internal` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `support_ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`created_by_user_id` varchar(36),
	`assigned_user_id` varchar(36),
	`subject` varchar(180) NOT NULL,
	`status` enum('open','in_progress','waiting','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`last_activity_at` timestamp(3) NOT NULL DEFAULT (now()),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technical_events` (
	`id` varchar(36) NOT NULL,
	`reference_id` varchar(40) NOT NULL,
	`level` enum('info','warning','error') NOT NULL,
	`event` varchar(120) NOT NULL,
	`context` json,
	`resolved_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `technical_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `error_reports` ADD CONSTRAINT `error_reports_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `error_reports` ADD CONSTRAINT `error_reports_reporter_user_id_users_id_fk` FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_ticket_messages` ADD CONSTRAINT `support_ticket_messages_ticket_id_support_tickets_id_fk` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_ticket_messages` ADD CONSTRAINT `support_ticket_messages_author_user_id_users_id_fk` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_assigned_user_id_users_id_fk` FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `error_reports_tenant_status_idx` ON `error_reports` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `support_ticket_messages_ticket_idx` ON `support_ticket_messages` (`ticket_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `support_tickets_tenant_status_idx` ON `support_tickets` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `support_tickets_priority_activity_idx` ON `support_tickets` (`priority`,`last_activity_at`);--> statement-breakpoint
CREATE INDEX `technical_events_level_created_idx` ON `technical_events` (`level`,`created_at`);--> statement-breakpoint
CREATE INDEX `technical_events_reference_idx` ON `technical_events` (`reference_id`);