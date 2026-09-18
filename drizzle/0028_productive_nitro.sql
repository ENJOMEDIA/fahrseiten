ALTER TABLE `subscriptions` ADD `plan_name_snapshot` varchar(120);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `monthly_price_cents_snapshot` int;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `setup_price_cents_snapshot` int;--> statement-breakpoint
ALTER TABLE `tenant_onboarding_tokens` ADD `lead_id` varchar(36);--> statement-breakpoint
ALTER TABLE `tenants` ADD `customer_number` varchar(32);--> statement-breakpoint
UPDATE `subscriptions` AS `subscription`
INNER JOIN `plans` AS `plan` ON `plan`.`id` = `subscription`.`plan_id`
SET
  `subscription`.`plan_name_snapshot` = `plan`.`public_name`,
  `subscription`.`monthly_price_cents_snapshot` = `plan`.`monthly_price_cents`,
  `subscription`.`setup_price_cents_snapshot` = `plan`.`setup_price_cents`;--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `plan_name_snapshot` varchar(120) NOT NULL;--> statement-breakpoint
UPDATE `tenants`
SET `customer_number` = CONCAT('FS-', UPPER(SUBSTRING(REPLACE(`id`, '-', ''), 1, 12)));--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `customer_number` varchar(32) NOT NULL;--> statement-breakpoint
UPDATE `tenant_onboarding_tokens` AS `onboarding`
INNER JOIN (
  SELECT LOWER(`email`) AS `email_key`, MIN(`id`) AS `id`
  FROM `sales_leads`
  WHERE `email` IS NOT NULL
  GROUP BY LOWER(`email`)
  HAVING COUNT(*) = 1
) AS `lead`
  ON `lead`.`email_key` = LOWER(JSON_UNQUOTE(JSON_EXTRACT(`onboarding`.`prefill`, '$.ownerEmail')))
SET `onboarding`.`lead_id` = `lead`.`id`
WHERE `onboarding`.`lead_id` IS NULL;--> statement-breakpoint
ALTER TABLE `sales_leads` ADD CONSTRAINT `sales_leads_converted_tenant_unique` UNIQUE(`converted_tenant_id`);--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_customer_number_unique` UNIQUE(`customer_number`);--> statement-breakpoint
CREATE INDEX `tenant_onboarding_tokens_lead_idx` ON `tenant_onboarding_tokens` (`lead_id`);
