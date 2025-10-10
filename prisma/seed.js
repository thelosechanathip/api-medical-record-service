// prisma/seed.js
/* Idempotent seed: insert เฉพาะรายการที่ "ยังไม่มี" เท่านั้น */

const { PrismaClient } = require('@prisma/client');
const pm = new PrismaClient();

/** helper: ensure record exists (หาเจอ -> ข้าม, ไม่เจอ -> create) */
async function ensure(model, where, createData) {
    const found = await model.findFirst({ where });
    if (!found) {
        await model.create({ data: createData });
        return true;  // inserted
    }
    return false;   // skipped
}

/** helper: loop รายการ */
async function ensureMany(model, items) {
    let inserted = 0;
    for (const { where, data } of items) {
        if (await ensure(model, where, data)) inserted++;
    }
    return inserted;
}

async function main() {
    await pm.$connect();

    // ===== hcodes (ใช้คีย์: hcode หรือ hcode_name ที่เป็น unique) =====
    let n = await ensureMany(pm.hcodes, [
        {
            where: { OR: [{ hcode: 11098 }, { hcode_name: 'โรงพยาบาลอากาศอำนวย' }] },
            data: { hcode: 11098, hcode_name: 'โรงพยาบาลอากาศอำนวย' },
        },
    ]);
    console.log(`✅ Hcodes inserted: ${n} (skipped ${1 - n})`);

    // ===== patient_services (ใช้ชื่ออังกฤษ/ไทยเป็นคีย์) =====
    n = await ensureMany(pm.patient_services, [
        {
            where: {
                OR: [
                    { patient_service_name_english: 'OPD' },
                    { patient_service_name_thai: 'ผู้ป่วยนอก' },
                ]
            },
            data: { patient_service_name_english: 'OPD', patient_service_name_thai: 'ผู้ป่วยนอก', priority: 1 },
        },
        {
            where: {
                OR: [
                    { patient_service_name_english: 'IPD' },
                    { patient_service_name_thai: 'ผู้ป่วยใน' },
                ]
            },
            data: { patient_service_name_english: 'IPD', patient_service_name_thai: 'ผู้ป่วยใน', priority: 2 },
        },
    ]);
    console.log(`✅ Patient services inserted: ${n}`);

    // ดึง service id มาใช้เป็นคีย์ร่วม
    const fpsIpd = await pm.patient_services.findFirst({
        where: { patient_service_name_english: 'IPD' },
        select: { patient_service_id: true },
    });
    const fpsOpd = await pm.patient_services.findFirst({
        where: { patient_service_name_english: 'OPD' },
        select: { patient_service_id: true },
    });

    // ===== content_of_medical_records (คีย์: patient_service_id + ชื่อ) =====
    const ipdContent = [
        { name: 'Dischange summary: Dx., OP', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: false, miss: true, no: true, pointsDed: false, priority: 1 },
        { name: 'Dischange summary: Other', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: false, p9: false, na: false, miss: true, no: true, pointsDed: false, priority: 2 },
        { name: 'Informed summary', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: false, miss: true, no: true, pointsDed: false, priority: 3 },
        { name: 'History', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: false, miss: true, no: true, pointsDed: false, priority: 4 },
        { name: 'Physical exam', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: false, miss: true, no: true, pointsDed: false, priority: 5 },
        { name: 'Progress note', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: false, miss: true, no: true, pointsDed: false, priority: 6 },
        { name: 'Consultation record', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: true, miss: true, no: true, pointsDed: false, priority: 7 },
        { name: 'Anesthetic record', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: true, miss: true, no: true, pointsDed: false, priority: 8 },
        { name: 'Operative note', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: true, miss: true, no: true, pointsDed: false, priority: 9 },
        { name: 'Labour record', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: true, miss: true, no: true, pointsDed: false, priority: 10 },
        { name: 'Rehabilitation record', p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: true, miss: true, no: true, pointsDed: false, priority: 11 },
        { name: "Nurses' note", p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: true, p9: true, na: false, miss: true, no: true, pointsDed: true, priority: 12 },
    ];

    n = await ensureMany(pm.content_of_medical_records, ipdContent.map(c => ({
        where: {
            AND: [
                { patient_service_id: fpsIpd.patient_service_id },
                { content_of_medical_record_name: c.name },
            ],
        },
        data: {
            content_of_medical_record_name: c.name,
            na_type: c.na, missing_type: c.miss, no_type: c.no,
            criterion_number_1_type: c.p1,
            criterion_number_2_type: c.p2,
            criterion_number_3_type: c.p3,
            criterion_number_4_type: c.p4,
            criterion_number_5_type: c.p5,
            criterion_number_6_type: c.p6,
            criterion_number_7_type: c.p7,
            criterion_number_8_type: c.p8,
            criterion_number_9_type: c.p9,
            points_deducted_type: c.pointsDed ?? false,
            priority: c.priority,
            patient_service_id: fpsIpd.patient_service_id,
        },
    })));
    console.log(`✅ Content of medical record (IPD) inserted: ${n}`);

    const opdContent = [
        { name: "Patient's Profile", na: false, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: false, pointsDed: true, followUpDate: false, priority: 1 },
        { name: "History (1 st visit)", na: false, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: true, pointsDed: false, followUpDate: false, priority: 2 },
        { name: "Physical examination/Diagnosis", na: false, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: false, pointsDed: false, followUpDate: false, priority: 3 },
        { name: "Treatment/Investigation", na: false, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: true, pointsDed: false, followUpDate: false, priority: 4 },
        { name: "Follow up ครั้งที่ 1", na: true, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: true, pointsDed: false, followUpDate: true, priority: 5 },
        { name: "Follow up ครั้งที่ 2", na: true, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: true, pointsDed: false, followUpDate: true, priority: 6 },
        { name: "Follow up ครั้งที่ 3", na: true, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: true, pointsDed: false, followUpDate: true, priority: 7 },
        { name: "Operative note", na: true, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: false, pointsDed: false, followUpDate: false, priority: 8 },
        { name: "Informed consent", na: true, miss: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, pointsAward: false, pointsDed: false, followUpDate: false, priority: 9 },
        { name: "Rehabilitation record *", na: false, miss: false, p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false, pointsAward: false, followUpDate: false, pointsDed: false, priority: 10 },
    ];

    n = await ensureMany(pm.content_of_medical_records, opdContent.map(c => ({
        where: {
            AND: [
                { patient_service_id: fpsOpd.patient_service_id },
                { content_of_medical_record_name: c.name },
            ],
        },
        data: {
            content_of_medical_record_name: c.name,
            na_type: c.na, missing_type: c.miss,
            criterion_number_1_type: c.p1,
            criterion_number_2_type: c.p2,
            criterion_number_3_type: c.p3,
            criterion_number_4_type: c.p4,
            criterion_number_5_type: c.p5,
            criterion_number_6_type: c.p6,
            criterion_number_7_type: c.p7,
            points_awarded_type: c.pointsAward ?? false,
            points_deducted_type: c.pointsDed ?? false,
            priority: c.priority,
            followUpDate: c.followUpDate,
            patient_service_id: fpsOpd.patient_service_id,
        },
    })));
    console.log(`✅ Content of medical record (OPD) inserted: ${n}`);

    // ===== review_status (คีย์: patient_service_id + ชื่อ) =====
    n = await ensureMany(pm.review_status, [
        // IPD
        {
            where: {
                AND: [
                    { patient_service_id: fpsIpd.patient_service_id },
                    { review_status_name: 'Documentation inadequate for meaningful review' },
                ]
            },
            data: {
                review_status_name: 'Documentation inadequate for meaningful review',
                review_status_description: 'ข้อมูลไม่เพียงพอสำหรับการทบทวน',
                review_status_type: false,
                priority: 1,
                patient_service_id: fpsIpd.patient_service_id,
            },
        },
        {
            where: {
                AND: [
                    { patient_service_id: fpsIpd.patient_service_id },
                    { review_status_name: 'No Significant medical record issue identified' },
                ]
            },
            data: {
                review_status_name: 'No Significant medical record issue identified',
                review_status_description: 'ไม่มีปัญหาสำคัญจากการทบทวน',
                review_status_type: false,
                priority: 2,
                patient_service_id: fpsIpd.patient_service_id,
            },
        },
        {
            where: {
                AND: [
                    { patient_service_id: fpsIpd.patient_service_id },
                    { review_status_name: 'Certain issues in question specify' },
                ]
            },
            data: {
                review_status_name: 'Certain issues in question specify',
                review_status_description: 'มีปัญหาจากการทบทวนที่ต้องค้นต่อ',
                review_status_type: true,
                priority: 3,
                patient_service_id: fpsIpd.patient_service_id,
            },
        },

        // OPD
        {
            where: {
                AND: [
                    { patient_service_id: fpsOpd.patient_service_id },
                    { review_status_name: 'Documentation inadequate for meaningful review' },
                ]
            },
            data: {
                review_status_name: 'Documentation inadequate for meaningful review',
                review_status_description: 'ข้อมูลไม่เพียงพอสำหรับการทบทวน',
                review_status_type: false,
                priority: 1,
                patient_service_id: fpsOpd.patient_service_id,
            },
        },
        {
            where: {
                AND: [
                    { patient_service_id: fpsOpd.patient_service_id },
                    { review_status_name: 'No Significant medical record issue identified' },
                ]
            },
            data: {
                review_status_name: 'No Significant medical record issue identified',
                review_status_description: 'ไม่มีปัญหาสำคัญจากการทบทวน',
                review_status_type: false,
                priority: 2,
                patient_service_id: fpsOpd.patient_service_id,
            },
        },
        {
            where: {
                AND: [
                    { patient_service_id: fpsOpd.patient_service_id },
                    { review_status_name: 'Certain issues in question specify' },
                ]
            },
            data: {
                review_status_name: 'Certain issues in question specify',
                review_status_description: 'มีปัญหาจากการทบทวนที่ต้องค้นต่อ',
                review_status_type: true,
                priority: 3,
                patient_service_id: fpsOpd.patient_service_id,
            },
        },
    ]);
    console.log(`✅ Review status inserted: ${n}`);

    // ===== overall_finding (คีย์: patient_service_id + ชื่อ) =====
    n = await ensureMany(pm.overall_finding, [
        {
            where: {
                AND: [
                    { patient_service_id: fpsIpd.patient_service_id },
                    { overall_finding_name: 'การจัดเรียงเวชระเบียนไม่เป็นไปตามมาตรฐานที่กำหนด' },
                ]
            },
            data: {
                overall_finding_name: 'การจัดเรียงเวชระเบียนไม่เป็นไปตามมาตรฐานที่กำหนด',
                priority: 1,
                patient_service_id: fpsIpd.patient_service_id,
            },
        },
        {
            where: {
                AND: [
                    { patient_service_id: fpsIpd.patient_service_id },
                    { overall_finding_name: 'เอกสารบางแผ่นไม่มีชื่อผู้รับบริการ HN AN ทำให้ไม่สามารุระบุได้ว่า เอกสารแผ่นนี้เป็นของใครจึงไม่สามารถทบทวนเอกสารแผ่นนั้นได้' },
                ]
            },
            data: {
                overall_finding_name: 'เอกสารบางแผ่นไม่มีชื่อผู้รับบริการ HN AN ทำให้ไม่สามารุระบุได้ว่า เอกสารแผ่นนี้เป็นของใครจึงไม่สามารถทบทวนเอกสารแผ่นนั้นได้',
                priority: 2,
                patient_service_id: fpsIpd.patient_service_id,
            },
        },
    ]);
    console.log(`✅ Overall finding inserted: ${n}`);

    // ===== clinical_details (คีย์: patient_service_id + ชื่อ) =====
    n = await ensureMany(pm.clinical_details, [
        {
            where: {
                AND: [
                    { patient_service_id: fpsOpd.patient_service_id },
                    { clinical_detail_name: 'General case' },
                ]
            },
            data: {
                clinical_detail_name: 'General case',
                patient_service_id: fpsOpd.patient_service_id,
                priority: 1,
                check_status: false,
            },
        },
        {
            where: {
                AND: [
                    { patient_service_id: fpsOpd.patient_service_id },
                    { clinical_detail_name: 'Chronic case' },
                ]
            },
            data: {
                clinical_detail_name: 'Chronic case',
                patient_service_id: fpsOpd.patient_service_id,
                priority: 2,
                check_status: true,
            },
        },
    ]);
    console.log(`✅ Clinical details inserted: ${n}`);
}

main()
    .then(() => pm.$disconnect())
    .catch((e) => {
        console.error('❌ Seed error:', e);
        pm.$disconnect().finally(() => process.exit(1));
    });
