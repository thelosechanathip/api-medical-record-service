-- DropIndex
DROP INDEX `patients_hcode_id_fkey` ON `patients`;

-- DropIndex
DROP INDEX `review_status_patient_service_id_fkey` ON `review_status`;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_hcode_id_fkey` FOREIGN KEY (`hcode_id`) REFERENCES `hcodes`(`hcode_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_status` ADD CONSTRAINT `review_status_patient_service_id_fkey` FOREIGN KEY (`patient_service_id`) REFERENCES `patient_services`(`patient_service_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
