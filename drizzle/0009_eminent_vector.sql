ALTER TABLE `component` ADD `reviewed_at` datetime(3);--> statement-breakpoint
ALTER TABLE `component` ADD `reviewed_by` varchar(64);--> statement-breakpoint
ALTER TABLE `component` ADD `review_note` text;--> statement-breakpoint
ALTER TABLE `component` ADD CONSTRAINT `component_reviewed_by_user_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `component_review_idx` ON `component` (`status`,`created_at`);