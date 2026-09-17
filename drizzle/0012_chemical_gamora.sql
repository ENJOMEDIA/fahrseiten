ALTER TABLE `platform_settings` ADD `maintenance_mode` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `platform_settings` ADD `maintenance_message` varchar(500) DEFAULT 'Hier entsteht die neue FahrSeiten-Plattform für moderne Fahrschulen.' NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD `maintenance_mode` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD `maintenance_message` varchar(500) DEFAULT 'Unsere neue Website entsteht gerade. Bald findest du hier alle wichtigen Informationen rund um unsere Fahrschule.' NOT NULL;