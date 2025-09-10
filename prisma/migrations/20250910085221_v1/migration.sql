-- CreateTable
CREATE TABLE `auth_tokens` (
    `auth_token_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `otp_verified` TINYINT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,
    `is_active` TINYINT NULL DEFAULT 1,

    PRIMARY KEY (`auth_token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_token_blacklist` (
    `auth_token_blacklist_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `blacklisted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`auth_token_blacklist_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_logs` (
    `auth_log_id` VARCHAR(191) NOT NULL,
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

    PRIMARY KEY (`auth_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `patient_services` (
    `patient_service_id` VARCHAR(191) NOT NULL,
    `patient_service_name_english` VARCHAR(191) NOT NULL,
    `patient_service_name_thai` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `patient_services_patient_service_name_english_key`(`patient_service_name_english`),
    UNIQUE INDEX `patient_services_patient_service_name_thai_key`(`patient_service_name_thai`),
    PRIMARY KEY (`patient_service_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `review_status` (
    `review_status_id` VARCHAR(191) NOT NULL,
    `review_status_name` VARCHAR(191) NOT NULL,
    `review_status_description` VARCHAR(191) NOT NULL,
    `review_status_type` INTEGER NULL,
    `patient_service_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `review_status_review_status_name_key`(`review_status_name`),
    PRIMARY KEY (`review_status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_hcode_id_fkey` FOREIGN KEY (`hcode_id`) REFERENCES `hcodes`(`hcode_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_status` ADD CONSTRAINT `review_status_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
