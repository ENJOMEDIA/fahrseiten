CREATE TABLE `consent_records` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`subject_hash` varchar(64) NOT NULL,
	`notice_version` varchar(80) NOT NULL,
	`choices` json NOT NULL,
	`source_host` varchar(253) NOT NULL,
	`withdrawn_at` timestamp(3),
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `consent_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_documents` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`scope` enum('platform','tenant') NOT NULL,
	`document_type` enum('imprint','privacy') NOT NULL,
	`version` int NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`content` text NOT NULL,
	`warning_acknowledged_at` timestamp(3),
	`effective_at` timestamp(3),
	`published_at` timestamp(3),
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `legal_documents_scope_version_unique` UNIQUE(`scope`,`tenant_id`,`document_type`,`version`)
);
--> statement-breakpoint
CREATE TABLE `privacy_requests` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`request_type` enum('export','deletion') NOT NULL,
	`status` enum('received','identity_check','processing','completed','rejected') NOT NULL DEFAULT 'received',
	`requester_email_hash` varchar(64) NOT NULL,
	`due_at` timestamp(3),
	`completed_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `privacy_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retention_policies` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`data_category` varchar(100) NOT NULL,
	`retention_days` int NOT NULL,
	`legal_basis` varchar(255),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `retention_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `retention_policies_tenant_category_unique` UNIQUE(`tenant_id`,`data_category`)
);
--> statement-breakpoint
CREATE TABLE `subprocessors` (
	`id` varchar(36) NOT NULL,
	`name` varchar(180) NOT NULL,
	`purpose` text NOT NULL,
	`country` varchar(100),
	`privacy_url` varchar(500),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `subprocessors_id` PRIMARY KEY(`id`),
	CONSTRAINT `subprocessors_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `consent_records` ADD CONSTRAINT `consent_records_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `legal_documents` ADD CONSTRAINT `legal_documents_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `legal_documents` ADD CONSTRAINT `legal_documents_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `privacy_requests` ADD CONSTRAINT `privacy_requests_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `retention_policies` ADD CONSTRAINT `retention_policies_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `consent_records_subject_idx` ON `consent_records` (`subject_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `consent_records_expiry_idx` ON `consent_records` (`expires_at`);--> statement-breakpoint
CREATE INDEX `legal_documents_tenant_status_idx` ON `legal_documents` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `privacy_requests_tenant_status_idx` ON `privacy_requests` (`tenant_id`,`status`);