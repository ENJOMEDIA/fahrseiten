ALTER TABLE `feature_flags` ADD `addon_available` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `feature_flags` ADD `addon_price_cents` int;--> statement-breakpoint
ALTER TABLE `plans` ADD `public_name` varchar(120) DEFAULT 'Paket' NOT NULL;--> statement-breakpoint
ALTER TABLE `plans` ADD `description` text;--> statement-breakpoint
ALTER TABLE `plans` ADD `monthly_price_cents` int;--> statement-breakpoint
ALTER TABLE `plans` ADD `setup_price_cents` int;--> statement-breakpoint
ALTER TABLE `plans` ADD `position` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `plans` ADD `highlighted` boolean DEFAULT false NOT NULL;