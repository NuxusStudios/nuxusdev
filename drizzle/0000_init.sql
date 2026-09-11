CREATE TABLE `account` (
	`id` varchar(64) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` datetime(3),
	`refresh_token_expires_at` datetime(3),
	`scope` text,
	`password` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `account_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_provider_unique` UNIQUE(`provider_id`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE `bookmark` (
	`user_id` varchar(64) NOT NULL,
	`component_id` varchar(120) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `bookmark_user_id_component_id_pk` PRIMARY KEY(`user_id`,`component_id`)
);
--> statement-breakpoint
CREATE TABLE `collection` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	`is_public` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `collection_id` PRIMARY KEY(`id`),
	CONSTRAINT `collection_user_slug_unique` UNIQUE(`user_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `collection_item` (
	`collection_id` varchar(64) NOT NULL,
	`component_id` varchar(120) NOT NULL,
	`added_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `collection_item_collection_id_component_id_pk` PRIMARY KEY(`collection_id`,`component_id`)
);
--> statement-breakpoint
CREATE TABLE `component` (
	`id` varchar(64) NOT NULL,
	`author_id` varchar(64) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`code` text NOT NULL,
	`demo_code` text NOT NULL,
	`file_name` varchar(160) NOT NULL,
	`demo_file_name` varchar(160) NOT NULL,
	`tags` json NOT NULL,
	`dependencies` json NOT NULL,
	`license` varchar(64) NOT NULL DEFAULT 'MIT License',
	`source_url` varchar(500),
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`bookmark_count` int NOT NULL DEFAULT 0,
	`view_count` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `component_id` PRIMARY KEY(`id`),
	CONSTRAINT `component_author_slug_unique` UNIQUE(`author_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(64) NOT NULL,
	`token` varchar(255) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`ip_address` varchar(64),
	`user_agent` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`plan` varchar(32) NOT NULL DEFAULT 'free',
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`seats` int NOT NULL DEFAULT 1,
	`current_period_end` datetime(3),
	`cancel_at_period_end` boolean NOT NULL DEFAULT false,
	`provider` varchar(32),
	`provider_customer_id` varchar(255),
	`provider_subscription_id` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `subscription_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`handle` varchar(64),
	`bio` text,
	`website` varchar(255),
	`location` varchar(120),
	`github_username` varchar(120),
	`twitter_username` varchar(120),
	`role` varchar(32) NOT NULL DEFAULT 'user',
	`banned` boolean NOT NULL DEFAULT false,
	`ban_reason` text,
	`ban_expires` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_handle_unique` UNIQUE(`handle`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(64) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collection` ADD CONSTRAINT `collection_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collection_item` ADD CONSTRAINT `collection_item_collection_id_collection_id_fk` FOREIGN KEY (`collection_id`) REFERENCES `collection`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `component` ADD CONSTRAINT `component_author_id_user_id_fk` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `bookmark_component_idx` ON `bookmark` (`component_id`);--> statement-breakpoint
CREATE INDEX `collection_user_idx` ON `collection` (`user_id`);--> statement-breakpoint
CREATE INDEX `collection_item_component_idx` ON `collection_item` (`component_id`);--> statement-breakpoint
CREATE INDEX `component_status_idx` ON `component` (`status`);--> statement-breakpoint
CREATE INDEX `component_author_idx` ON `component` (`author_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscription_user_idx` ON `subscription` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscription_status_idx` ON `subscription` (`status`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);