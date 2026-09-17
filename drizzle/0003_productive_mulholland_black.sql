CREATE TABLE `course_dates` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`course_id` varchar(36) NOT NULL,
	`starts_at` timestamp(3) NOT NULL,
	`ends_at` timestamp(3) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'Europe/Berlin',
	CONSTRAINT `course_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`title` varchar(160) NOT NULL,
	`description` text,
	`location_id` varchar(36),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `license_classes` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`key` varchar(30) NOT NULL,
	`title` varchar(120) NOT NULL,
	`description` text,
	`minimum_age` int,
	CONSTRAINT `license_classes_id` PRIMARY KEY(`id`),
	CONSTRAINT `license_classes_tenant_key_unique` UNIQUE(`tenant_id`,`key`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`name` varchar(160) NOT NULL,
	`street` varchar(180) NOT NULL,
	`postal_code` varchar(20) NOT NULL,
	`city` varchar(120) NOT NULL,
	`phone` varchar(40),
	`email` varchar(254),
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opening_hours` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`location_id` varchar(36) NOT NULL,
	`weekday` int NOT NULL,
	`opens_at` varchar(5),
	`closes_at` varchar(5),
	`closed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `opening_hours_id` PRIMARY KEY(`id`),
	CONSTRAINT `opening_hours_location_weekday_unique` UNIQUE(`location_id`,`weekday`)
);
--> statement-breakpoint
CREATE TABLE `price_groups` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`title` varchar(140) NOT NULL,
	`description` text,
	CONSTRAINT `price_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_items` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`price_group_id` varchar(36) NOT NULL,
	`label` varchar(180) NOT NULL,
	`description` text,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`unit` varchar(80),
	CONSTRAINT `price_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`name` varchar(160) NOT NULL,
	`role` varchar(120) NOT NULL,
	`bio` text,
	`qualifications` json NOT NULL,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`display_name` varchar(100) NOT NULL,
	`quote` text NOT NULL,
	`rating` int,
	`source_label` varchar(100),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`name` varchar(160) NOT NULL,
	`category` varchar(80) NOT NULL,
	`transmission` enum('manual','automatic') NOT NULL,
	`description` text,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `course_dates` ADD CONSTRAINT `course_dates_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_dates` ADD CONSTRAINT `course_dates_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `license_classes` ADD CONSTRAINT `license_classes_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opening_hours` ADD CONSTRAINT `opening_hours_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opening_hours` ADD CONSTRAINT `opening_hours_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_groups` ADD CONSTRAINT `price_groups_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_items` ADD CONSTRAINT `price_items_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_items` ADD CONSTRAINT `price_items_price_group_id_price_groups_id_fk` FOREIGN KEY (`price_group_id`) REFERENCES `price_groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `course_dates_tenant_start_idx` ON `course_dates` (`tenant_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `courses_tenant_position_idx` ON `courses` (`tenant_id`,`position`);--> statement-breakpoint
CREATE INDEX `locations_tenant_position_idx` ON `locations` (`tenant_id`,`position`);--> statement-breakpoint
CREATE INDEX `price_groups_tenant_position_idx` ON `price_groups` (`tenant_id`,`position`);--> statement-breakpoint
CREATE INDEX `price_items_tenant_group_idx` ON `price_items` (`tenant_id`,`price_group_id`);--> statement-breakpoint
CREATE INDEX `team_members_tenant_position_idx` ON `team_members` (`tenant_id`,`position`);--> statement-breakpoint
CREATE INDEX `testimonials_tenant_position_idx` ON `testimonials` (`tenant_id`,`position`);--> statement-breakpoint
CREATE INDEX `vehicles_tenant_position_idx` ON `vehicles` (`tenant_id`,`position`);