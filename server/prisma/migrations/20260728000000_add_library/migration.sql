-- CreateTable
CREATE TABLE `library` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mangaId` VARCHAR(191) NOT NULL,
    `status` ENUM('none', 'reading', 'on_hold', 'dropped', 'plan_to_read', 'completed', 're_reading') NOT NULL DEFAULT 'plan_to_read',
    `chapters_read` INTEGER NULL DEFAULT 0,
    `score` INTEGER NULL,
    `notes` TEXT NULL,
    `start_date` DATE NULL,
    `finish_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,

    INDEX `library_user_id_idx`(`user_id`),
    UNIQUE INDEX `library_user_id_mangaId_key`(`user_id`, `mangaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `library` ADD CONSTRAINT `library_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
