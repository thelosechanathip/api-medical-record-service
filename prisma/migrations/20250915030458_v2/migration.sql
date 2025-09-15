-- AlterTable
ALTER TABLE `content_of_medical_records` MODIFY `na_type` BOOLEAN NULL DEFAULT false,
    MODIFY `missing_type` BOOLEAN NULL DEFAULT false,
    MODIFY `no_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_1_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_2_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_3_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_4_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_5_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_6_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_7_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_8_type` BOOLEAN NULL DEFAULT false,
    MODIFY `criterion_number_9_type` BOOLEAN NULL DEFAULT false,
    MODIFY `points_deducted_type` BOOLEAN NULL DEFAULT false;
