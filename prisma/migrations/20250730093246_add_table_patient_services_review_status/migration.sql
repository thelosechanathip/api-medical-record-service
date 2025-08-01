-- CreateTable
CREATE TABLE `patient_services` (
    `patient_service_id` VARCHAR(191) NOT NULL,
    `patient_service_name_english` VARCHAR(191) NOT NULL,
    `patient_service_name_thai` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`patient_service_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_status` (
    `review_status_id` VARCHAR(191) NOT NULL,
    `review_status_name` VARCHAR(191) NOT NULL,
    `review_status_description` VARCHAR(191) NOT NULL,
    `review_status_type` INTEGER NOT NULL,
    `patient_service_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`review_status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review_status` ADD CONSTRAINT `review_status_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
