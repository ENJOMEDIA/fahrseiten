ALTER TABLE `error_reports` ADD `priority` enum('normal','high') DEFAULT 'normal' NOT NULL;--> statement-breakpoint
CREATE INDEX `error_reports_priority_created_idx` ON `error_reports` (`priority`,`created_at`);--> statement-breakpoint

UPDATE `feature_flags`
SET
  `title` = 'Erweiterte Medienverwaltung',
  `description` = 'Kategorisierte Medienbibliothek, Bildzuschnitt und optimierte Wiederverwendung im Builder.',
  `default_status` = 'unavailable'
WHERE `key` = 'media_branding';--> statement-breakpoint

UPDATE `feature_flags`
SET `default_status` = 'unavailable'
WHERE `key` IN (
  'managed_website',
  'website_builder',
  'content_modules',
  'custom_domain',
  'legal_consent',
  'maintenance_preview',
  'media_branding',
  'theme_templates',
  'multi_location',
  'priority_support'
);--> statement-breakpoint

UPDATE `feature_flags`
SET `description` = 'Meldungen werden im Support-Dashboard hervorgehoben und priorisiert bearbeitet.'
WHERE `key` = 'priority_support';
