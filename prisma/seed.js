// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const pm = new PrismaClient()

async function main() {
    await pm.$connect()

    // 💥table hcodes
    await pm.hcodes.createMany({
        data: [
            { hcode: 11098, hcode_name: 'โรงพยาบาลอากาศอำนวย' },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Hcodes completed')

    // 💥table patient_services
    await pm.patient_services.createMany({
        data: [
            { patient_service_name_english: 'OPD/ER', patient_service_name_thai: 'ผู้ป่วยนอก/ห้องฉุกเฉิน', priority: 1 },
            { patient_service_name_english: 'IPD', patient_service_name_thai: 'ผู้ป่วยใน', priority: 2 },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Patient services completed')

    const fpsIpd = await pm.patient_services.findFirst({ where: { patient_service_name_english: 'IPD' }, select: { patient_service_id: true } })
    const fpsOpdEr = await pm.patient_services.findFirst({ where: { patient_service_name_english: 'OPD/ER' }, select: { patient_service_id: true } })

    // 💥table content_of_medical_records IPD
    await pm.content_of_medical_records.createMany({
        data: [
            {
                content_of_medical_record_name: 'Dischange summary: Dx., OP',
                na_type: false,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 1,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Dischange summary: Other',
                na_type: false,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: false,
                criterion_number_9_type: false,
                points_deducted_type: false,
                priority: 2,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Informed summary',
                na_type: false,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 3,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'History',
                na_type: false,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 4,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Physical exam',
                na_type: false,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 5,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Progress note',
                na_type: false,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 6,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Consultation record',
                na_type: true,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 7,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Anesthetic record',
                na_type: true,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 8,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Operative note',
                na_type: true,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 9,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Labour record',
                na_type: true,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 10,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: 'Rehabilitation record',
                na_type: true,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: false,
                priority: 11,
                patient_service_id: fpsIpd.patient_service_id,
            },
            {
                content_of_medical_record_name: "Nurses' note",
                na_type: false,
                missing_type: true,
                no_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                criterion_number_8_type: true,
                criterion_number_9_type: true,
                points_deducted_type: true,
                priority: 12,
                patient_service_id: fpsIpd.patient_service_id,
            },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Content of medical record IPD completed')

    // 💥table content_of_medical_records OPD & ER
    await pm.content_of_medical_records.createMany({
        data: [
            {
                content_of_medical_record_name: "Patient's Profile",
                na_type: false,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: false,
                points_deducted_type: true,
                priority: 1,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "History (1 st visit)",
                na_type: false,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: true,
                points_deducted_type: false,
                priority: 2,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Physical examination/Diagnosis",
                na_type: false,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: false,
                points_deducted_type: false,
                priority: 3,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Treatment/Investigation",
                na_type: false,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: true,
                points_deducted_type: false,
                priority: 4,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Follow up ครั้งที่ 1",
                na_type: true,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: true,
                points_deducted_type: false,
                priority: 5,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Follow up ครั้งที่ 2",
                na_type: true,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: true,
                points_deducted_type: false,
                priority: 6,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Follow up ครั้งที่ 3",
                na_type: true,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: true,
                points_deducted_type: false,
                priority: 7,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Operative note",
                na_type: true,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: false,
                points_deducted_type: false,
                priority: 8,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Informed consent",
                na_type: true,
                missing_type: true,
                criterion_number_1_type: true,
                criterion_number_2_type: true,
                criterion_number_3_type: true,
                criterion_number_4_type: true,
                criterion_number_5_type: true,
                criterion_number_6_type: true,
                criterion_number_7_type: true,
                points_awarded_type: false,
                points_deducted_type: false,
                priority: 9,
                patient_service_id: fpsOpdEr.patient_service_id,
            },
            {
                content_of_medical_record_name: "Rehabilitation record *",
                na_type: false,
                missing_type: false,
                criterion_number_1_type: false,
                criterion_number_2_type: false,
                criterion_number_3_type: false,
                criterion_number_4_type: false,
                criterion_number_5_type: false,
                criterion_number_6_type: false,
                criterion_number_7_type: false,
                points_awarded_type: false,
                points_deducted_type: false,
                priority: 10,
                patient_service_id: fpsOpdEr.patient_service_id,
            }
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Content of medical record OPD & ER completed')

    // 💥table review_status IPD
    await pm.review_status.createMany({
        data: [
            {
                review_status_name: "Documentation inadequate for meaningful review",
                review_status_description: "ข้อมูลไม่เพียงพอสำหรับการทบทวน",
                review_status_type: false,
                patient_service_id: fpsIpd.patient_service_id,
                priority: 1,
            },
            {
                review_status_name: "No Significant medical record issue identified",
                review_status_description: "ไม่มีปัญหาสำคัญจากการทบทวน",
                review_status_type: false,
                patient_service_id: fpsIpd.patient_service_id,
                priority: 2,
            },
            {
                review_status_name: "Certain issues in question specify",
                review_status_description: "มีปัญหาจากการทบทวนที่ต้องค้นต่อ",
                review_status_type: true,
                patient_service_id: fpsIpd.patient_service_id,
                priority: 3,
            },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Review status IPD completed')

    // 💥table review_status OPD & ER
    await pm.review_status.createMany({
        data: [
            {
                review_status_name: "Documentation inadequate for meaningful review",
                review_status_description: "ข้อมูลไม่เพียงพอสำหรับการทบทวน",
                review_status_type: false,
                patient_service_id: fpsOpdEr.patient_service_id,
                priority: 1,
            },
            {
                review_status_name: "No Significant medical record issue identified",
                review_status_description: "ไม่มีปัญหาสำคัญจากการทบทวน",
                review_status_type: false,
                patient_service_id: fpsOpdEr.patient_service_id,
                priority: 2,
            },
            {
                review_status_name: "Certain issues in question specify",
                review_status_description: "มีปัญหาจากการทบทวนที่ต้องค้นต่อ",
                review_status_type: true,
                patient_service_id: fpsOpdEr.patient_service_id,
                priority: 3,
            },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Review status OPD & ER completed')

    // 💥table overall_finding
    await pm.overall_finding.createMany({
        data: [
            {
                overall_finding_name: "การจัดเรียงเวชระเบียนไม่เป็นไปตามมาตรฐานที่กำหนด",
                patient_service_id: fpsIpd.patient_service_id,
                priority: 1,
            },
            {
                overall_finding_name: "เอกสารบางแผ่นไม่มีชื่อผู้รับบริการ HN AN ทำให้ไม่สามารุระบุได้ว่า เอกสารแผ่นนี้เป็นของใครจึงไม่สามารถทบทวนเอกสารแผ่นนั้นได้",
                patient_service_id: fpsIpd.patient_service_id,
                priority: 2,
            },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Overall finding completed')

    // 💥table clinical_details
    await pm.clinical_details.createMany({
        data: [
            {
                clinical_detail_name: "General case",
                patient_service_id: fpsOpdEr.patient_service_id,
                priority: 1,
            },
            {
                clinical_detail_name: "Chronic case",
                patient_service_id: fpsOpdEr.patient_service_id,
                priority: 2,
            }
        ]
    })
    console.log('✅ Clinical details OPD & ER completed')
}

main()
    .then(() => pm.$disconnect())
    .catch((e) => {
        console.error('❌ Seed error:', e)
        pm.$disconnect().finally(() => process.exit(1))
    })
