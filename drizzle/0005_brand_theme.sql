CREATE TABLE `brand_theme` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL DEFAULT 'My theme',
	`vars` text NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `brand_theme_id` PRIMARY KEY(`id`),
	CONSTRAINT `brand_theme_user_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `brand_theme` ADD CONSTRAINT `brand_theme_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;