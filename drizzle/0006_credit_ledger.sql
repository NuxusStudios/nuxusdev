CREATE TABLE `credit_ledger` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`delta` int NOT NULL,
	`reason` varchar(40) NOT NULL,
	`note` varchar(200),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `credit_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `credit_ledger` ADD CONSTRAINT `credit_ledger_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `credit_ledger_user_idx` ON `credit_ledger` (`user_id`);--> statement-breakpoint
CREATE INDEX `credit_ledger_created_idx` ON `credit_ledger` (`created_at`);