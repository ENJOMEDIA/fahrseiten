ALTER TABLE `media_assets` ADD `category` varchar(40) DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `platform_settings` ADD `demo_available_during_maintenance` boolean DEFAULT true NOT NULL;--> statement-breakpoint

INSERT INTO `feature_flags` (`id`, `key`, `title`, `description`, `default_status`, `addon_available`, `addon_price_cents`) VALUES
  ('61000000-0000-4000-8000-000000000011', 'theme_templates', 'Designvorlagen', 'Drei abgestimmte Website-Themes im Builder auswählen.', 'unavailable', false, NULL)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `default_status` = VALUES(`default_status`),
  `addon_available` = VALUES(`addon_available`),
  `addon_price_cents` = VALUES(`addon_price_cents`);--> statement-breakpoint

INSERT INTO `plan_features` (`plan_id`, `feature_id`, `status`)
SELECT p.id, f.id, 'enabled'
FROM `plans` p
JOIN `feature_flags` f ON f.`key` = 'theme_templates'
WHERE p.`key` IN ('wachstum', 'pole-position')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);
