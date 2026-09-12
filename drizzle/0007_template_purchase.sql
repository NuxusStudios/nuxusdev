CREATE TABLE `template_purchase` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`template_slug` varchar(120) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'usd',
	`stripe_session_id` varchar(255) NOT NULL,
	`stripe_payment_intent_id` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `template_purchase_id` PRIMARY KEY(`id`),
	CONSTRAINT `template_purchase_session_unique` UNIQUE(`stripe_session_id`)
);
--> statement-breakpoint
ALTER TABLE `template_purchase` ADD CONSTRAINT `template_purchase_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `template_purchase_user_idx` ON `template_purchase` (`user_id`);