/*
  Warnings:

  - You are about to drop the column `customer` on the `project` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `project` DROP COLUMN `customer`,
    ADD COLUMN `clientId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('UNFILLED', 'FILLED', 'COMPLETED') NOT NULL DEFAULT 'UNFILLED';

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
