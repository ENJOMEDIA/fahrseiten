CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`actor_user_id` varchar(36),
	`action` varchar(120) NOT NULL,
	`entity_type` varchar(80) NOT NULL,
	`entity_id` varchar(80),
	`metadata` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `domains` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`hostname` varchar(253) NOT NULL,
	`status` enum('pending','verification_required','verified','active','error','disabled') NOT NULL DEFAULT 'pending',
	`is_primary` boolean NOT NULL DEFAULT false,
	`redirect_to_domain_id` varchar(36),
	`verification_token_hash` varchar(128),
	`verified_at` timestamp(3),
	`ssl_status` varchar(40) NOT NULL DEFAULT 'unknown',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `domains_hostname_unique` UNIQUE(`hostname`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` varchar(36) NOT NULL,
	`key` varchar(100) NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`default_status` enum('unavailable','coming_soon','beta','enabled') NOT NULL DEFAULT 'unavailable',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `feature_flags_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `plan_features` (
	`plan_id` varchar(36) NOT NULL,
	`feature_id` varchar(36) NOT NULL,
	`status` enum('unavailable','coming_soon','beta','enabled') NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `plan_features_plan_id_feature_id_pk` PRIMARY KEY(`plan_id`,`feature_id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` varchar(36) NOT NULL,
	`key` varchar(80) NOT NULL,
	`internal_name` varchar(120) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`locale` varchar(10) NOT NULL DEFAULT 'de-DE',
	`timezone` varchar(64) NOT NULL DEFAULT 'Europe/Berlin',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sites_id` PRIMARY KEY(`id`),
	CONSTRAINT `sites_tenant_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`plan_id` varchar(36) NOT NULL,
	`status` varchar(40) NOT NULL DEFAULT 'active',
	`starts_at` timestamp(3) NOT NULL DEFAULT (now()),
	`ends_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_features` (
	`tenant_id` varchar(36) NOT NULL,
	`feature_id` varchar(36) NOT NULL,
	`status` enum('unavailable','coming_soon','beta','enabled') NOT NULL,
	`reason` varchar(255),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_features_tenant_id_feature_id_pk` PRIMARY KEY(`tenant_id`,`feature_id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_memberships` (
	`tenant_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` enum('tenant_owner','tenant_editor','tenant_viewer') NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_memberships_tenant_id_user_id_pk` PRIMARY KEY(`tenant_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(254) NOT NULL,
	`display_name` varchar(160) NOT NULL,
	`password_hash` varchar(255),
	`platform_role` enum('platform_owner','platform_sales','platform_support'),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `domains` ADD CONSTRAINT `domains_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plan_features` ADD CONSTRAINT `plan_features_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plan_features` ADD CONSTRAINT `plan_features_feature_id_feature_flags_id_fk` FOREIGN KEY (`feature_id`) REFERENCES `feature_flags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sites` ADD CONSTRAINT `sites_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_features` ADD CONSTRAINT `tenant_features_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_features` ADD CONSTRAINT `tenant_features_feature_id_feature_flags_id_fk` FOREIGN KEY (`feature_id`) REFERENCES `feature_flags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_memberships` ADD CONSTRAINT `tenant_memberships_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_memberships` ADD CONSTRAINT `tenant_memberships_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_tenant_created_idx` ON `audit_logs` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `domains_tenant_idx` ON `domains` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_tenant_idx` ON `subscriptions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `tenant_memberships_user_idx` ON `tenant_memberships` (`user_id`);