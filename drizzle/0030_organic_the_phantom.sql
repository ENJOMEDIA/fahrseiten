CREATE TABLE `contract_documents` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`subscription_id` varchar(36),
	`contract_number` varchar(80) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('prepared','sent','signed','declined','expired','cancelled') NOT NULL DEFAULT 'prepared',
	`sha256` varchar(64) NOT NULL,
	`storage_key` varchar(500) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`byte_size` int NOT NULL,
	`signed_storage_key` varchar(500),
	`evidence_storage_key` varchar(500),
	`signed_at` timestamp(3),
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `contract_documents_number_unique` UNIQUE(`contract_number`)
);
--> statement-breakpoint
CREATE TABLE `signature_events` (
	`id` varchar(36) NOT NULL,
	`signature_request_id` varchar(36) NOT NULL,
	`provider_event_id` varchar(190) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`payload_sha256` varchar(64) NOT NULL,
	`occurred_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `signature_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `signature_events_provider_event_unique` UNIQUE(`provider_event_id`)
);
--> statement-breakpoint
CREATE TABLE `signature_requests` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`contract_document_id` varchar(36) NOT NULL,
	`provider` varchar(80) NOT NULL,
	`external_id` varchar(190),
	`signer_name` varchar(160) NOT NULL,
	`signer_email` varchar(254) NOT NULL,
	`status` enum('created','pending','opened','signed','declined','expired','cancelled','failed') NOT NULL DEFAULT 'created',
	`signing_url` varchar(1000),
	`expires_at` timestamp(3),
	`last_event_at` timestamp(3),
	`error_code` varchar(100),
	`created_by_user_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `signature_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `signature_requests_provider_external_unique` UNIQUE(`provider`,`external_id`)
);
--> statement-breakpoint
ALTER TABLE `contract_documents` ADD CONSTRAINT `contract_documents_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_documents` ADD CONSTRAINT `contract_documents_subscription_id_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_documents` ADD CONSTRAINT `contract_documents_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_events` ADD CONSTRAINT `signature_events_signature_request_id_signature_requests_id_fk` FOREIGN KEY (`signature_request_id`) REFERENCES `signature_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_requests` ADD CONSTRAINT `signature_requests_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_requests` ADD CONSTRAINT `signature_requests_contract_document_id_contract_documents_id_fk` FOREIGN KEY (`contract_document_id`) REFERENCES `contract_documents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_requests` ADD CONSTRAINT `signature_requests_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contract_documents_tenant_created_idx` ON `contract_documents` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `signature_events_request_idx` ON `signature_events` (`signature_request_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `signature_requests_contract_idx` ON `signature_requests` (`contract_document_id`);--> statement-breakpoint
CREATE INDEX `signature_requests_tenant_status_idx` ON `signature_requests` (`tenant_id`,`status`);