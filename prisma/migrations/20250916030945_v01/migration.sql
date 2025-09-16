-- CreateTable
CREATE TABLE `auth_tokens` (
    `auth_token_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `otp_verified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `auth_tokens_token_key`(`token`),
    INDEX `auth_tokens_user_id_idx`(`user_id`),
    INDEX `auth_tokens_otp_verified_is_active_idx`(`otp_verified`, `is_active`),
    INDEX `auth_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`auth_token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_token_blacklist` (
    `auth_token_blacklist_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `blacklisted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `auth_token_blacklist_token_key`(`token`),
    INDEX `auth_token_blacklist_expires_at_idx`(`expires_at`),
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

    INDEX `auth_logs_created_at_idx`(`created_at`),
    INDEX `auth_logs_endpoint_idx`(`endpoint`),
    PRIMARY KEY (`auth_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hcodes` (
    `hcode_id` VARCHAR(191) NOT NULL,
    `hcode` INTEGER NOT NULL,
    `hcode_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',

    UNIQUE INDEX `hcodes_hcode_key`(`hcode`),
    UNIQUE INDEX `hcodes_hcode_name_key`(`hcode_name`),
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
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

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
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

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

    INDEX `patient_service_logs_created_at_idx`(`created_at`),
    INDEX `patient_service_logs_endpoint_idx`(`endpoint`),
    PRIMARY KEY (`patient_service_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_status` (
    `review_status_id` VARCHAR(191) NOT NULL,
    `review_status_name` VARCHAR(191) NOT NULL,
    `review_status_description` VARCHAR(191) NOT NULL,
    `review_status_type` BOOLEAN NULL,
    `patient_service_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

    UNIQUE INDEX `review_status_review_status_name_key`(`review_status_name`),
    PRIMARY KEY (`review_status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_status_logs` (
    `review_status_log_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `request_method` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `execution_time` INTEGER NOT NULL,
    `row_count` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `review_status_logs_created_at_idx`(`created_at`),
    INDEX `review_status_logs_endpoint_idx`(`endpoint`),
    PRIMARY KEY (`review_status_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_of_medical_records` (
    `content_of_medical_record_id` VARCHAR(191) NOT NULL,
    `content_of_medical_record_name` VARCHAR(100) NOT NULL,
    `na_type` BOOLEAN NULL DEFAULT false,
    `missing_type` BOOLEAN NULL DEFAULT false,
    `no_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_1_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_2_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_3_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_4_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_5_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_6_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_7_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_8_type` BOOLEAN NULL DEFAULT false,
    `criterion_number_9_type` BOOLEAN NULL DEFAULT false,
    `points_deducted_type` BOOLEAN NULL DEFAULT false,
    `patient_service_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

    UNIQUE INDEX `content_of_medical_records_content_of_medical_record_name_key`(`content_of_medical_record_name`),
    PRIMARY KEY (`content_of_medical_record_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_of_medical_record_logs` (
    `content_of_medical_record_log_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `request_method` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `execution_time` INTEGER NOT NULL,
    `row_count` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `content_of_medical_record_logs_created_at_idx`(`created_at`),
    INDEX `content_of_medical_record_logs_endpoint_idx`(`endpoint`),
    PRIMARY KEY (`content_of_medical_record_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overall_finding` (
    `overall_finding_id` VARCHAR(191) NOT NULL,
    `overall_finding_name` LONGTEXT NOT NULL,
    `patient_service_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'admin',
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT 'admin',

    PRIMARY KEY (`overall_finding_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overall_finding_logs` (
    `overall_finding_log_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `request_method` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `execution_time` INTEGER NOT NULL,
    `row_count` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `overall_finding_logs_created_at_idx`(`created_at`),
    INDEX `overall_finding_logs_endpoint_idx`(`endpoint`),
    PRIMARY KEY (`overall_finding_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_hcode_id_fkey` FOREIGN KEY (`hcode_id`) REFERENCES `hcodes`(`hcode_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_status` ADD CONSTRAINT `review_status_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_of_medical_records` ADD CONSTRAINT `content_of_medical_records_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overall_finding` ADD CONSTRAINT `overall_finding_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE SET NULL ON UPDATE CASCADE;
