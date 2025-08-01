-- CreateTable
CREATE TABLE `patients` (
    `patient_id` VARCHAR(191) NOT NULL,
    `hcode_id` VARCHAR(191) NOT NULL,
    `patient_fullname` VARCHAR(191) NOT NULL,
    `patient_hn` VARCHAR(191) NOT NULL,
    `patient_vn` VARCHAR(191) NULL,
    `patient_an` VARCHAR(191) NULL,
    `patient_ward` VARCHAR(191) NULL,
    `patient_date_service` VARCHAR(191) NULL,
    `patient_date_admitted` VARCHAR(191) NULL,
    `patient_date_discharged` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `patients_patient_vn_key`(`patient_vn`),
    UNIQUE INDEX `patients_patient_an_key`(`patient_an`),
    PRIMARY KEY (`patient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_hcode_id_fkey` FOREIGN KEY (`hcode_id`) REFERENCES `hcodes`(`hcode_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
