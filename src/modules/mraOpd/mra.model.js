const pm = require('../../libs/prisma')
const db_h = require('../../libs/db_h')
const db_b = require('../../libs/db_b')

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

// บันทึกข้อมูลการทำงานของ form_ipds
exports.InsertLog = async (data) => await pm.form_ipd_logs.create({ data: data })

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
exports.FetchOneMedicalRecordAuditOpd = async (patient_id) => {
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