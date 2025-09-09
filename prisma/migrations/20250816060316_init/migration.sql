-- DropIndex
DROP INDEX `patients_hcode_id_fkey` ON `patients`;

-- DropIndex
DROP INDEX `review_status_patient_service_id_fkey` ON `review_status`;

-- CreateTable
CREATE TABLE `patient_service_logs` (
    `patient_service_log_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `request_method` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `execution_time` INTEGER NOT NULL,
    `row_count` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(191) NULL,

    PRIMARY KEY (`patient_service_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_hcode_id_fkey` FOREIGN KEY (`hcode_id`) REFERENCES `hcodes`(`hcode_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_status` ADD CONSTRAINT `review_status_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
