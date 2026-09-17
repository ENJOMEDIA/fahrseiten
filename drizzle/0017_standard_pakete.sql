INSERT INTO `feature_flags` (`id`, `key`, `title`, `description`, `default_status`, `addon_available`, `addon_price_cents`) VALUES
  ('61000000-0000-4000-8000-000000000001', 'managed_website', 'Öffentliche Fahrschulwebsite', 'Moderner Webauftritt auf der eigenen Kundendomain.', 'enabled', false, NULL),
  ('61000000-0000-4000-8000-000000000002', 'content_modules', 'Fahrschul-Inhalte', 'Klassen, Preise, Kurse, Team, Fahrzeuge, Standorte und FAQ.', 'enabled', false, NULL),
  ('61000000-0000-4000-8000-000000000003', 'custom_domain', 'Eigene Domain', 'DNS-Begleitung, SSL-Status und Betrieb auf der Kundendomain.', 'enabled', false, NULL),
  ('61000000-0000-4000-8000-000000000004', 'legal_consent', 'Recht & Consent', 'Geführte Rechtstexte und technische Consent-Steuerung.', 'enabled', false, NULL),
  ('61000000-0000-4000-8000-000000000005', 'maintenance_preview', 'Wartungs- & Vorschauseite', 'Gebrandete Vorschauseite bis zur öffentlichen Freigabe.', 'enabled', false, NULL),
  ('61000000-0000-4000-8000-000000000006', 'media_branding', 'Logo, Favicon & Medien', 'Eigener Markenauftritt mit sicher verwalteten Bilddateien.', 'enabled', true, 990),
  ('61000000-0000-4000-8000-000000000007', 'multi_location', 'Mehrere Standorte', 'Zusätzliche Fahrschulstandorte strukturiert verwalten.', 'enabled', true, 990),
  ('61000000-0000-4000-8000-000000000008', 'priority_support', 'Priorisierter Support', 'Anliegen werden im Betrieb bevorzugt bearbeitet.', 'enabled', true, 1990),
  ('61000000-0000-4000-8000-000000000009', 'website_builder', 'Website-Builder', 'Seiten und kontrollierte Blöcke bearbeiten.', 'coming_soon', false, NULL),
  ('61000000-0000-4000-8000-000000000010', 'contact_management', 'Anfragen & Kontakte', 'Kontaktformular und einfache Bearbeitung eingehender Anfragen.', 'coming_soon', false, NULL)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `default_status` = VALUES(`default_status`),
  `addon_available` = VALUES(`addon_available`),
  `addon_price_cents` = VALUES(`addon_price_cents`);--> statement-breakpoint

INSERT INTO `plans` (`id`, `key`, `internal_name`, `public_name`, `description`, `monthly_price_cents`, `setup_price_cents`, `position`, `highlighted`, `active`) VALUES
  ('41000000-0000-4000-8000-000000000001', 'startklar', 'Startklar', 'Startklar', 'Der professionelle Einstieg mit eigener Domain, allen wichtigen Fahrschulinhalten und rechtlicher Grundstruktur.', 3990, 29900, 0, false, true),
  ('41000000-0000-4000-8000-000000000002', 'wachstum', 'Wachstum', 'Wachstum', 'Mehr Markenfreiheit und Medienverwaltung für Fahrschulen, die ihren Auftritt regelmäßig weiterentwickeln.', 6990, 49900, 1, true, true),
  ('41000000-0000-4000-8000-000000000003', 'pole-position', 'Pole Position', 'Pole Position', 'Der umfangreichste Auftritt für Fahrschulen mit mehreren Standorten und priorisierter Betreuung.', 9990, 79900, 2, false, true)
ON DUPLICATE KEY UPDATE
  `public_name` = VALUES(`public_name`),
  `description` = VALUES(`description`),
  `monthly_price_cents` = VALUES(`monthly_price_cents`),
  `setup_price_cents` = VALUES(`setup_price_cents`),
  `position` = VALUES(`position`),
  `highlighted` = VALUES(`highlighted`),
  `active` = VALUES(`active`);--> statement-breakpoint

INSERT INTO `plan_features` (`plan_id`, `feature_id`, `status`)
SELECT p.id, f.id, 'enabled'
FROM `plans` p
JOIN `feature_flags` f ON f.`key` IN ('managed_website', 'content_modules', 'custom_domain', 'legal_consent', 'maintenance_preview')
WHERE p.`key` IN ('startklar', 'wachstum', 'pole-position')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);--> statement-breakpoint

INSERT INTO `plan_features` (`plan_id`, `feature_id`, `status`)
SELECT p.id, f.id, 'enabled'
FROM `plans` p
JOIN `feature_flags` f ON f.`key` = 'media_branding'
WHERE p.`key` IN ('wachstum', 'pole-position')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);--> statement-breakpoint

INSERT INTO `plan_features` (`plan_id`, `feature_id`, `status`)
SELECT p.id, f.id, 'enabled'
FROM `plans` p
JOIN `feature_flags` f ON f.`key` IN ('multi_location', 'priority_support')
WHERE p.`key` = 'pole-position'
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);
