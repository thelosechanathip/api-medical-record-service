/*
  Warnings:

  - Made the column `patient_service_id` on table `content_of_medical_records` required. This step will fail if there are existing NULL values in that column.
  - Made the column `patient_service_id` on table `overall_finding` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `content_of_medical_records` DROP FOREIGN KEY `content_of_medical_records_patient_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `overall_finding` DROP FOREIGN KEY `overall_finding_patient_service_id_fkey`;

-- DropIndex
DROP INDEX `content_of_medical_records_patient_service_id_fkey` ON `content_of_medical_records`;

-- DropIndex
DROP INDEX `overall_finding_patient_service_id_fkey` ON `overall_finding`;

-- AlterTable
ALTER TABLE `content_of_medical_records` MODIFY `patient_service_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `overall_finding` MODIFY `patient_service_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `form_ipds` (
    `form_ipd_id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

    PRIMARY KEY (`form_ipd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_ipd_logs` (
    `form_ipd_log_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `request_method` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `execution_time` INTEGER NOT NULL,
    `row_count` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `form_ipd_logs_created_at_idx`(`created_at`),
    INDEX `form_ipd_logs_endpoint_idx`(`endpoint`),
    PRIMARY KEY (`form_ipd_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_ipd_content_of_medical_record_results` (
    `form_ipd_content_of_medical_record_result_id` VARCHAR(191) NOT NULL,
    `form_ipd_id` VARCHAR(191) NOT NULL,
    `content_of_medical_record_id` VARCHAR(191) NOT NULL,
    `na` BOOLEAN NULL,
    `missing` BOOLEAN NULL,
    `no` BOOLEAN NULL,
    `criterion_number_1` INTEGER NULL,
    `criterion_number_2` INTEGER NULL,
    `criterion_number_3` INTEGER NULL,
    `criterion_number_4` INTEGER NULL,
    `criterion_number_5` INTEGER NULL,
    `criterion_number_6` INTEGER NULL,
    `criterion_number_7` INTEGER NULL,
    `criterion_number_8` INTEGER NULL,
    `criterion_number_9` INTEGER NULL,
    `point_deducted` INTEGER NULL,
    `total_score` INTEGER NULL,
    `comment` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

    PRIMARY KEY (`form_ipd_content_of_medical_record_result_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_ipd_review_status_results` (
    `form_ipd_review_status_result_id` VARCHAR(191) NOT NULL,
    `form_ipd_id` VARCHAR(191) NOT NULL,
    `review_status_id` VARCHAR(191) NOT NULL,
    `review_status_result` BOOLEAN NULL,
    `review_status_comment` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

    PRIMARY KEY (`form_ipd_review_status_result_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_ipd_overall_finding_results` (
    `form_ipd_overall_finding_result_id` VARCHAR(191) NOT NULL,
    `form_ipd_id` VARCHAR(191) NOT NULL,
    `overall_finding_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

    PRIMARY KEY (`form_ipd_overall_finding_result_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `content_of_medical_records` ADD CONSTRAINT `content_of_medical_records_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overall_finding` ADD CONSTRAINT `overall_finding_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_ipds` ADD CONSTRAINT `form_ipds_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_ipd_content_of_medical_record_results` ADD CONSTRAINT `form_ipd_content_of_medical_record_results_form_ipd_id_fkey` FOREIGN KEY (`form_ipd_id`) REFERENCES `form_ipds`(`form_ipd_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_ipd_content_of_medical_record_results` ADD CONSTRAINT `form_ipd_content_of_medical_record_results_content_of_medic_fkey` FOREIGN KEY (`content_of_medical_record_id`) REFERENCES `content_of_medical_records`(`content_of_medical_record_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_ipd_review_status_results` ADD CONSTRAINT `form_ipd_review_status_results_form_ipd_id_fkey` FOREIGN KEY (`form_ipd_id`) REFERENCES `form_ipds`(`form_ipd_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_ipd_review_status_results` ADD CONSTRAINT `form_ipd_review_status_results_review_status_id_fkey` FOREIGN KEY (`review_status_id`) REFERENCES `review_status`(`review_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_ipd_overall_finding_results` ADD CONSTRAINT `form_ipd_overall_finding_results_form_ipd_id_fkey` FOREIGN KEY (`form_ipd_id`) REFERENCES `form_ipds`(`form_ipd_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_ipd_overall_finding_results` ADD CONSTRAINT `form_ipd_overall_finding_results_overall_finding_id_fkey` FOREIGN KEY (`overall_finding_id`) REFERENCES `overall_finding`(`overall_finding_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
