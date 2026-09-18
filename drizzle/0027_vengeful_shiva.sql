ALTER TABLE `legal_documents` MODIFY COLUMN `document_type` enum('imprint','privacy','terms') NOT NULL;--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_response` varchar(40);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_response_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_response_email` varchar(254);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_consent_text_version` varchar(80);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_confirmation_token_hash` varchar(64);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_confirmation_expires_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_confirmed_at` timestamp(3);