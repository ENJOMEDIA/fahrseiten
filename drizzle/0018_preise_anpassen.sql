UPDATE `plans`
SET `monthly_price_cents` = 2990, `setup_price_cents` = 9900
WHERE `key` = 'startklar';--> statement-breakpoint

UPDATE `plans`
SET `monthly_price_cents` = 4990, `setup_price_cents` = 19900
WHERE `key` = 'wachstum';--> statement-breakpoint

UPDATE `plans`
SET `monthly_price_cents` = 7990, `setup_price_cents` = 29900
WHERE `key` = 'pole-position';
