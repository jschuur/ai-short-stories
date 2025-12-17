CREATE TABLE `audios` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text(50) NOT NULL,
	`story_id` text,
	`provider` text NOT NULL,
	`settings` text NOT NULL,
	`size` integer NOT NULL,
	`generate_time` integer NOT NULL,
	`filename` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE no action
);
