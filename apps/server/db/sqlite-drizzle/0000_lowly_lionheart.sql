CREATE TABLE `todo` (
	`done` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`public_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `todo_public_id_unique` ON `todo` (`public_id`);