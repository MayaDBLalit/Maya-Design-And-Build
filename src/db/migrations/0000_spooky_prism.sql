CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'admin',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `gallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`media_type` varchar(20) NOT NULL DEFAULT 'image',
	`media_url` varchar(500) NOT NULL,
	`thumbnail_url` varchar(500),
	`duration_seconds` int,
	`file_size_bytes` bigint,
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50) NOT NULL,
	`interested_service` varchar(150),
	`message` text,
	`tentative_budget` decimal(14,2),
	`status` varchar(30) NOT NULL DEFAULT 'new',
	`admin_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiry_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiry_id` int NOT NULL,
	`service_rate_id` int,
	`service_name_snapshot` varchar(150) NOT NULL,
	`unit_name_snapshot` varchar(50) NOT NULL,
	`unit_rate_snapshot` decimal(12,2) NOT NULL,
	`user_quantity` decimal(12,2) NOT NULL,
	`calculated_amount` decimal(14,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inquiry_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`media_url` varchar(500) NOT NULL,
	`media_type` varchar(20) NOT NULL DEFAULT 'image',
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`category` varchar(30) NOT NULL DEFAULT 'completed',
	`location` varchar(200),
	`client_name` varchar(150),
	`client_number` varchar(50),
	`cost_estimate` decimal(14,2),
	`description` text,
	`main_image_url` varchar(500),
	`old_elevation_url` varchar(500),
	`new_elevation_url` varchar(500),
	`display_order` int NOT NULL DEFAULT 0,
	`is_featured` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `service_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`service_name` varchar(150) NOT NULL,
	`unit_id` int NOT NULL,
	`base_rate` decimal(12,2) NOT NULL,
	`rate_type` varchar(30) NOT NULL DEFAULT 'per_sqft',
	`default_qty` decimal(12,2) NOT NULL DEFAULT '1.00',
	`is_active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`short_description` varchar(500),
	`detailed_content` text,
	`thumbnail_url` varchar(500),
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key_name` varchar(100) NOT NULL,
	`value_content` text,
	`group_name` varchar(50) NOT NULL DEFAULT 'general',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_name_unique` UNIQUE(`key_name`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`role_title` varchar(150) NOT NULL,
	`education` varchar(150),
	`experience_years` varchar(50),
	`bio` text,
	`image_url` varchar(500),
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_name` varchar(50) NOT NULL,
	`unit_symbol` varchar(20) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `units_id` PRIMARY KEY(`id`),
	CONSTRAINT `units_unit_name_unique` UNIQUE(`unit_name`)
);
--> statement-breakpoint
ALTER TABLE `inquiry_items` ADD CONSTRAINT `inquiry_items_inquiry_id_inquiries_id_fk` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inquiry_items` ADD CONSTRAINT `inquiry_items_service_rate_id_service_rates_id_fk` FOREIGN KEY (`service_rate_id`) REFERENCES `service_rates`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_media` ADD CONSTRAINT `project_media_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_rates` ADD CONSTRAINT `service_rates_unit_id_units_id_fk` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE restrict ON UPDATE no action;