ALTER TABLE `traffic_hourly`
  DROP INDEX `traffic_hourly_bucket_unique`,
  ADD `country_code` varchar(2),
  ADD `country_name` varchar(100),
  ADD `region` varchar(120),
  ADD `city` varchar(120),
  ADD `time_zone` varchar(64),
  ADD `utc_offset_minutes` int;
