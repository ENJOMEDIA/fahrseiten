ALTER TABLE `sales_leads` ADD `postal_landing_first_viewed_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_landing_last_viewed_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `sales_leads` ADD `postal_landing_view_count` int DEFAULT 0 NOT NULL;