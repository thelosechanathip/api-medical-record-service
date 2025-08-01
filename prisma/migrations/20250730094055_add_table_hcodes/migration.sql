/*
  Warnings:

  - A unique constraint covering the columns `[patient_service_name_english]` on the table `patient_services` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[patient_service_name_thai]` on the table `patient_services` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[review_status_name]` on the table `review_status` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `patient_services` MODIFY `created_by` VARCHAR(191) NULL,
    MODIFY `updated_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `review_status` MODIFY `review_status_type` INTEGER NULL,
    MODIFY `created_by` VARCHAR(191) NULL,
    MODIFY `updated_by` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `hcodes` (
    `hcode_id` VARCHAR(191) NOT NULL,
    `hcode` VARCHAR(191) NOT NULL,
    `hcode_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(191) NULL,

    PRIMARY KEY (`hcode_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `patient_services_patient_service_name_english_key` ON `patient_services`(`patient_service_name_english`);

-- CreateIndex
CREATE UNIQUE INDEX `patient_services_patient_service_name_thai_key` ON `patient_services`(`patient_service_name_thai`);

-- CreateIndex
CREATE UNIQUE INDEX `review_status_review_status_name_key` ON `review_status`(`review_status_name`);
