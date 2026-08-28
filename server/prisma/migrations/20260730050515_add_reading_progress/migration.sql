-- AlterTable
ALTER TABLE `library` ADD COLUMN `last_chapter_id` VARCHAR(191) NULL,
    ADD COLUMN `last_chapter_number` VARCHAR(50) NULL,
    ALTER COLUMN `updated_at` DROP DEFAULT;
