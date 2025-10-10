const pm = require('../../libs/prisma')
const db_h = require('../../libs/db_h')
const db_b = require('../../libs/db_b')

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

// บันทึกข้อมูลการทำงานของ form_ipds
exports.InsertLog = async (data) => await pm.form_opd_logs.create({ data: data })

// Remove Start #################################################################################################################################
// Remove ข้อมูล form_opd_review_status_results จำนวนหลาย record อ้างอิงจาก form_opd_id
exports.RemoveFormOpdReviewStatusResult = async (form_opd_id) =>
    await pm.form_opd_review_status_results.deleteMany({ where: { form_opd_id: form_opd_id } })

// Remove ข้อมูล form_opd_content_of_medical_record_results จำนวนหลาย record อ้างอิงจาก form_opd_id
exports.RemoveFormOpdContentOfMedicalRecordResult = async (form_opd_id) =>
    await pm.form_opd_content_of_medical_record_results.deleteMany({ where: { form_opd_id: form_opd_id } })

exports.RemoveFormClinicalDetailResult = async (form_opd_id) =>
    await pm.form_opd_clinical_detail_results.deleteMany({ where: { form_opd_id: form_opd_id } })

exports.RemovePdf = async (form_opd_id) => await pm.pdf_opd.deleteMany({ where: { form_opd_id: form_opd_id } })

// Remove ข้อมูล form_opds จำนวน 1 record อ้างอิงจาก form_opd_id
exports.RemoveFormOpd = async (form_opd_id) =>
    await pm.form_opds.delete({ where: { form_opd_id: form_opd_id } })

// Remove ข้อมูล patients จำนวน 1 record อ้างอิงจาก patient_vn และส่งค่า patient_id ที่ลบแล้วกลับคืน
exports.RemovePatient = async (patient_vn) =>
    await pm.patients.delete({ where: { patient_vn: patient_vn }, select: { patient_id: true } })
// Remove End #################################################################################################################################

// Fetch Start #################################################################################################################################
// ดึงข้อมูล hcode_id จำนวน 1 record จากตาราง hcodes
exports.FetchHcode = async () => await pm.hcodes.findFirst({ select: { hcode_id: true } })

// ดึงข้อมูล patient_service_id จำนวน 1 record จากตาราง patient_services อ้างอิงจาก patient_service_name_english
exports.FetchOnePatientService = async () =>
    await pm.patient_services.findFirst({ select: { patient_service_id: true }, where: { patient_service_name_english: 'OPD' } })

// ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_vn
exports.FetchPatientInMra = async (patient_vn) =>
    await pm.patients.findFirst({ where: { patient_vn: patient_vn }, select: { patient_id: true } })

// ดึงข้อมูล คนไข้ จำนวน 1 record มาจากระบบ HOSxP อ้างอิงจาก patient_vn
exports.FetchPatientInHos = async (patient_vn) => {
    const [rows] = await db_h.query(
        `
            SELECT
                CONCAT(pt.pname, pt.fname, ' ', pt.lname) AS fullname,
                o.hn,
                o.vn,
                i.an,
                pt.cid,
                w.name AS ward_name,
                o.vstdate,
                i.regdate,
                i.dchdate
            FROM
                ovst AS o
                LEFT OUTER JOIN ipt AS i ON o.vn = i.vn
                LEFT OUTER JOIN ward AS w ON i.ward = w.ward
                LEFT OUTER JOIN patient AS pt ON o.hn = pt.hn
            WHERE
                o.vn = ?
            LIMIT 1
        `, [patient_vn]
    )
    return pickFirst(rows)
}

// ดึงข้อมูล password จำนวน 1 record มาจากระบบ Backoffice อ้างอิงจาก fullname
exports.FetchPasswordInBackoffice = async (fullname) => {
    const [rows] = await db_b.query(
        `
            SELECT
                u.password
            FROM users AS u
            WHERE u.name = ?
            LIMIT 1
        `, [fullname]
    )
    return pickFirst(rows)
}

// ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_vn
exports.FetchVnInPatient = async (patient_vn) =>
    await pm.patients.findFirst({ where: { patient_vn: patient_vn }, select: { patient_id: true } })

// ดึงข้อมูล form_opd_id จำนวน 1 record จากตาราง form_opds อ้างอิงจาก patient_id
exports.FetchPatientIdInFormOpd = async (patient_id) =>
    await pm.form_opds.findFirst({ where: { patient_id: patient_id }, select: { form_opd_id: true } })

exports.FetchClinicalDetailById = async (clinical_detail_id) =>
    await pm.clinical_details.findFirst({ where: { clinical_detail_id: clinical_detail_id }, select: { check_status: true } })

// ดึงข้อมูลทั้งหมด content_of_medical_record_id จากตาราง content_of_medical_records อ้างอิงจาก patient_service_id และเรียงลำดับจากน้อยไปมากโดยอ้างอิง priority
exports.FetchContentOfMedicalRecordByPatientId = async (patient_service_id) => {
    return await pm.content_of_medical_records.findMany({
        where: { patient_service_id: patient_service_id },
        select: { content_of_medical_record_id: true },
        orderBy: { priority: 'asc' }
    })
}

/*
    ดึงข้อมูลทั้งหมดของตาราง form_opds
    join
        patients, form_opd_content_of_medical_record_results, form_opd_overall_finding_results, form_opd_review_status_results
    อ้างอิงจาก
        patient_id
*/
// exports.FetchOneMedicalRecordAuditOpd = async (patient_id) => {
//     return await pm.form_opds.findMany({
//         where: {
//             patient_id: patient_id
//         },
//         include: {
//             patient_id: false,
//             patients: {
//                 include: {
//                     hcode_id: false,
//                     hcodes: {
//                         select: {
//                             hcode_id: true,
//                             hcode_name: true
//                         }
//                     }
//                 }
//             },
//             form_opd_content_of_medical_record_results: {
//                 include: {
//                     content_of_medical_record_id: false,
//                     content_of_medical_records: {}
//                 },
//                 orderBy: {
//                     content_of_medical_records: { priority: 'asc' }
//                 }
//             },
//             form_opd_clinical_detail_results: {
//                 include: {
//                     clinical_detail_id: false,
//                     clinical_details: {}
//                 }
//             },
//             form_opd_review_status_results: {
//                 include: {
//                     review_status_id: false,
//                     review_status: {}
//                 }
//             }
//         }
//     })
// }

// ดึงข้อมูล form_opd_id จำนวน 1 record จากตาราง form_opds อ้างอิงจาก patient_id

exports.FetchOneFormOpdIdByPatientId = async (patient_id) =>
    await pm.form_opds.findFirst({ where: { patient_id: patient_id }, select: { form_opd_id: true } })

// ดึงข้อมูล review_status_id จำนวน 1 record จากตาราง form_opd_review_status_results อ้างอิงจาก form_opd_id
exports.FetchFormOpdReviewStatusResultsByFormOpdId = async (form_opd_id) => {
    return await pm.form_opd_review_status_results.findFirst({
        where: { form_opd_id: form_opd_id },
        select: { review_status_id: true }
    })
}

/*
    ดึงข้อมูลทั้งหมดของตาราง form_opds
    join
        patients, form_opd_content_of_medical_record_results, form_opd_overall_finding_results, form_opd_review_status_results
    อ้างอิงจาก
        patient_id
*/
exports.FetchOneMedicalRecordAuditOPD = async (patient_id) => {
    return await pm.form_opds.findMany({
        where: {
            patient_id: patient_id
        },
        include: {
            patient_id: false,
            patients: {
                include: {
                    hcode_id: false,
                    hcodes: {
                        select: {
                            hcode_id: true,
                            hcode_name: true
                        }
                    }
                }
            },
            form_opd_content_of_medical_record_results: {
                include: {
                    content_of_medical_record_id: false,
                    content_of_medical_records: {}
                },
                orderBy: {
                    content_of_medical_records: { priority: 'asc' }
                }
            },
            form_opd_clinical_detail_results: {
                include: {
                    clinical_detail_id: false,
                    clinical_details: {}
                }
            },
            form_opd_review_status_results: {
                include: {
                    review_status_id: false,
                    review_status: {}
                }
            }
        }
    })
}

/*
    ดึงข้อมูล 1 record จากตาราง form_opd_content_of_medical_record_results
    อ้างอิงจาก
        form_opd_content_of_medical_record_result_id, content_of_medical_record_id
*/
exports.FetchOneFormOpdContentOfMedicalRecordResult = async (form_opd_content_of_medical_record_result_id, content_of_medical_record_id) =>
    await pm.form_opd_content_of_medical_record_results.findFirst({
        where: {
            form_opd_content_of_medical_record_result_id: form_opd_content_of_medical_record_result_id,
            content_of_medical_record_id: content_of_medical_record_id
        }
    })

// ดึงข้อมูล review_status_type จำนวน 1 record จากตาราง review_status อ้างอิงจาก review_status_id
exports.FetchOneRSTOnReviewStatus = async (review_status_id) =>
    await pm.review_status.findFirst({ where: { review_status_id: review_status_id }, select: { review_status_type: true } })

// ดึงข้อมูล form_opd_id จำนวน 1 record จากตาราง form_opd_review_status_results อ้างอิงจาก form_opd_id
exports.CheckUniqueFormOpdReviewStatusResult = async (form_opd_id) =>
    await pm.form_opd_review_status_results.findFirst({ where: { form_opd_id: form_opd_id }, select: { form_opd_id: true } })

exports.FetchFollowUpDateByFollowUpDateType = async (content_of_medical_record_id) =>
    await pm.content_of_medical_records.findFirst({
        where: { content_of_medical_record_id: content_of_medical_record_id },
        select: { follow_up_date_type: true }
    })

exports.FetchVnByFormOpdId = async (form_opd_id) =>
    await pm.form_opds.findFirst({
        where: { form_opd_id: form_opd_id },
        select: {
            patients: {
                select: { patient_vn: true }
            }
        }
    })

exports.FetchOnePdfByFormOpdId = async (form_opd_id) =>
    await pm.pdf_opd.findFirst({
        where: { form_opd_id: form_opd_id },
        include: {
            form_opd_id: false,
            file_name: false,
            mime_type: false,
            created_at: false,
            created_by: false,
            pdf_opd_id: false,
            form_opds: {
                include: {
                    patients: {
                        select: {
                            patient_fullname: true,
                            patient_hn: true,
                            patient_date_admitted: true,
                            patient_date_discharged: true,
                            patient_ward: true
                        }
                    }
                }
            }
        }
    })
// Fetch End #################################################################################################################################

// Insert Start #################################################################################################################################
// บันทึกข้อมูลไปยังตาราง patients
exports.InsertPatient = async (data) => await pm.patients.create({ data: { ...data } })

// บันทึกข้อมูลไปยังตาราง form_opds
exports.InsertFormOpd = async (data) => await pm.form_opds.create({ data: { ...data } })

exports.InsertFormOpdClinicalDetailResult = async (data) => await pm.form_opd_clinical_detail_results.create({ data: { ...data } })

// บันทึกข้อมูลไปยังตาราง form_opd_content_of_medical_record_results แบบหลาย record พร้อมกัน
exports.InsertFormOpdContentOfMedicalRecordResult = async (data) =>
    await pm.form_opd_content_of_medical_record_results.createMany({ data: data })

// บันทึกข้อมูลไปยังตาราง form_opd_review_status_results
exports.InsertFormOpdReviewStatusResult = async (data) =>
    await pm.form_opd_review_status_results.create({ data: data })

exports.InsertPdf = async (data) => await pm.pdf_opd.create({ data: data })
// Insert End #################################################################################################################################

// Update Start #################################################################################################################################
/*
    อัพเดทข้อมูลไปยังตาราง form_opd_content_of_medical_record_results
    อ้างอิงจาก
        formOpdId, content_of_medical_record_id, form_opd_content_of_medical_record_result_id
*/
exports.UpdateFormOpdContentOfMedicalRecordResult = async (row, formOpdId) => {
    // เตรียม payload ตัด field ที่อาจเป็น undefined ออก
    const data = {
        na: row.na,
        missing: row.missing,
        criterion_number_1: row.criterion_number_1,
        criterion_number_2: row.criterion_number_2,
        criterion_number_3: row.criterion_number_3,
        criterion_number_4: row.criterion_number_4,
        criterion_number_5: row.criterion_number_5,
        criterion_number_6: row.criterion_number_6,
        criterion_number_7: row.criterion_number_7,
        point_deducted: row.point_deducted,
        point_awarded: row.point_awarded,
        total_score: row.total_score,
        score_obtained: row.score_obtained,
        follow_up_date: row.follow_up_date,
        comment: row.comment,
        updated_by: row.updated_by,
    }

    // ลบ key ที่เป็น undefined
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
    return pm.form_opd_content_of_medical_record_results.update({
        where: {
            form_opd_id: formOpdId,
            content_of_medical_record_id: row.content_of_medical_record_id,
            form_opd_content_of_medical_record_result_id: row.form_opd_content_of_medical_record_result_id,
        },
        data: data,
    })
}

exports.UpdateFormOpd = async (form_opd_id, data) => await pm.form_opds.update({ where: { form_opd_id: form_opd_id }, data: data })
// Update End #################################################################################################################################