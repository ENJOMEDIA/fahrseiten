ALTER TABLE `sales_leads` ADD `email_permission` varchar(40) DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `email_permission_evidence` text;--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `email_permission_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `email_opt_out_at` timestamp(3);