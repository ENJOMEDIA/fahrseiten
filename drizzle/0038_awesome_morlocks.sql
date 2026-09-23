ALTER TABLE `plans` ADD `minimum_term_months` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `cancellation_notice_months_snapshot` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `renews_indefinitely_snapshot` boolean DEFAULT true NOT NULL;