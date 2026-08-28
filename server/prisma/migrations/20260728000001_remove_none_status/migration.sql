-- Update existing 'none' statuses to 'plan_to_read'
UPDATE `library` SET `status` = 'plan_to_read' WHERE `status` = 'none';

-- AlterTable
ALTER TABLE `library` MODIFY `status` ENUM('reading', 'on_hold', 'dropped', 'plan_to_read', 'completed', 're_reading') NOT NULL DEFAULT 'plan_to_read',
    MODIFY `chapters_read` INTEGER NOT NULL DEFAULT 0,
    ALTER COLUMN `updated_at` DROP DEFAULT;
