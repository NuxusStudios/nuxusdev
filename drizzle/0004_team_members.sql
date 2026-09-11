CREATE TABLE `team_member` (
	`id` varchar(64) NOT NULL,
	`subscription_id` varchar(64) NOT NULL,
	`owner_id` varchar(64) NOT NULL,
	`email` varchar(255) NOT NULL,
	`user_id` varchar(64),
	`invite_hash` varchar(64) NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'pending',
	`expires_at` datetime(3),
	`accepted_at` datetime(3),
	`revoked_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `team_member_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_member_invite_unique` UNIQUE(`invite_hash`)
);
--> statement-breakpoint
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_subscription_id_subscription_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `team_member_subscription_idx` ON `team_member` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `team_member_user_idx` ON `team_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `team_member_owner_idx` ON `team_member` (`owner_id`);