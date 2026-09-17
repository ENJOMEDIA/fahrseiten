ALTER TABLE `media_assets` MODIFY COLUMN `tenant_id` varchar(36);--> statement-breakpoint
ALTER TABLE `platform_settings` ADD `logo_media_id` varchar(36);