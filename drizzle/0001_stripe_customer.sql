ALTER TABLE `user` ADD `stripe_customer_id` varchar(64);--> statement-breakpoint
CREATE INDEX `user_stripe_customer_idx` ON `user` (`stripe_customer_id`);