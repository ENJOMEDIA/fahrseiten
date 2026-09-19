ALTER TABLE `postal_dispatches` ADD `provider_checked_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `postal_dispatches` ADD `archived_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `postal_letter_templates` ADD `kicker_template` varchar(120) DEFAULT 'FAHRSEITEN FÜR FAHRSCHULEN' NOT NULL;