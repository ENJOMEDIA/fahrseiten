UPDATE `plans`
SET `setup_price_cents` = 4999
WHERE `key` = 'startklar';--> statement-breakpoint

UPDATE `plans`
SET `setup_price_cents` = 10000
WHERE `key` = 'wachstum';--> statement-breakpoint

UPDATE `plans`
SET `setup_price_cents` = 14999
WHERE `key` = 'pole-position';
