UPDATE `feature_flags`
SET
  `default_status` = 'enabled',
  `title` = 'Website-Builder',
  `description` = 'Seiten und kontrollierte Blöcke bearbeiten.'
WHERE `key` = 'website_builder';--> statement-breakpoint

INSERT INTO `plan_features` (`plan_id`, `feature_id`, `status`)
SELECT p.id, f.id, 'enabled'
FROM `plans` p
JOIN `feature_flags` f ON f.`key` = 'website_builder'
WHERE p.`active` = true
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);--> statement-breakpoint

INSERT INTO `feature_flags` (`id`, `key`, `title`, `description`, `default_status`, `addon_available`, `addon_price_cents`) VALUES
  ('61000000-0000-4000-8000-000000000012', 'team_management', 'Benutzerverwaltung', 'Mitarbeitende einladen und Zugriffe als Owner, Editor oder Betrachter steuern.', 'coming_soon', false, NULL)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `default_status` = VALUES(`default_status`);
