const pm = require('../../libs/prisma')
const db_h = require('../../libs/db_h')
const db_b = require('../../libs/db_b')

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

exports.InsertLog = async (data) => await pm.form_ipd_logs.create({ data: data })

// Remove Start #################################################################################################################################
exports.RemoveFormIpdReviewStatusResult = async (form_ipd_id) =>
    await pm.form_ipd_review_status_results.deleteMany({ where: { form_ipd_id: form_ipd_id } })

exports.RemoveFormIpdOverallFindingResult = async (form_ipd_id) =>
    await pm.form_ipd_overall_finding_results.deleteMany({ where: { form_ipd_id: form_ipd_id } })

exports.RemoveFormIpdContentOfMedicalRecordResult = async (form_ipd_id) =>
    await pm.form_ipd_content_of_medical_record_results.deleteMany({ where: { form_ipd_id: form_ipd_id } })

exports.RemoveFormIpd = async (form_ipd_id) =>
    await pm.form_ipds.delete({ where: { form_ipd_id: form_ipd_id } })

exports.RemovePatient = async (an) =>
    await pm.patients.delete({ where: { patient_an: an }, select: { patient_id: true } })
// Remove End #################################################################################################################################

// Fetch Start #################################################################################################################################
exports.FetchHcode = async () => await pm.hcodes.findFirst({ select: { hcode_id: true } })

exports.FetchOnePatientService = async () =>
    await pm.patient_services.findFirst({ select: { patient_service_id: true }, where: { patient_service_name_english: 'IPD' } })

exports.FetchPatientInMra = async (key, value) =>
    await pm.patients.findFirst({ where: { [key]: value }, select: { patient_id: true } })

// ดึงข้อมูล form_ipd_id จากตาราง form_ipds อ้างอิงจาก patient_id
exports.FetchOneFormIpdIdByPatientId = async (patient_id) =>
    await pm.form_ipds.findFirst({ where: { patient_id: patient_id }, select: { form_ipd_id: true } })

exports.FetchFormIRSRInMra = async (form_ipd_id) => {
    return await pm.form_ipd_review_status_results.findFirst({
        where: { form_ipd_id: form_ipd_id },
        select: { review_status_id: true }
    })
}

exports.FetchOneData = async (patient_id) => {
    return await pm.form_ipds.findMany({
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
            form_ipd_content_of_medical_record_results: {
                include: {
                    content_of_medical_record_id: false,
                    content_of_medical_records: {}
                }
            },
            form_ipd_overall_finding_results: {
                include: {
                    overall_finding_id: false,
                    overall_finding: {}
                }
            },
            form_ipd_review_status_results: {
                include: {
                    review_status_id: false,
                    review_status: {}
                }
            }
        }
    })
}

exports.FetchPatientInHos = async (patient_an) => {
    const [rows] = await db_h.query(
        `
            SELECT
                CONCAT(pt.pname, pt.fname, ' ', pt.lname) AS fullname,
                o.hn,
                o.vn,
                i.an,
                w.name AS ward_name,
                o.vstdate,
                i.regdate,
                i.dchdate
            FROM
                ovst AS o
                LEFT OUTER JOIN ipt AS i ON o.vn = i.vn
                LEFT OUTER JOIN ward AS w ON i.ward = w.ward
                LEFT OUTER JOIN patient AS pt ON i.hn = pt.hn
            WHERE
                i.an = ?
        `, [patient_an]
    )
    return pickFirst(rows)
}

exports.FetchContentOfMedicalRecordById = async (patient_service_id) => {
    return await pm.content_of_medical_records.findMany({
        where: { patient_service_id: patient_service_id },
        select: { content_of_medical_record_id: true },
        orderBy: { priority: 'asc' }
    })
}

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

// ดึงข้อมูล patient_id จากตาราง patients อ้างอิงจาก patient_an
exports.FetchAnInPatient = async (patient_an) =>
    await pm.patients.findFirst({ where: { patient_an: patient_an }, select: { patient_id: true } })

exports.FetchPatientIdInFormIpd = async (data) => await pm.form_ipds.findFirst({ where: data, select: { form_ipd_id: true } })

exports.FetchOverallFindingByPatientId = async (patient_service_id) => {
    return await pm.overall_finding.findMany({
        where: { patient_service_id: patient_service_id },
        select: { overall_finding_id: true },
        orderBy: { priority: 'asc' }
    })
}

exports.FetchOneFormIpdContentOfMedicalRecordResult = async (form_ipd_content_of_medical_record_result_id, content_of_medical_record_id) =>
    await pm.form_ipd_content_of_medical_record_results.findFirst({
        where: {
            form_ipd_content_of_medical_record_result_id: form_ipd_content_of_medical_record_result_id,
            content_of_medical_record_id: content_of_medical_record_id
        }
    })

exports.FetchOneFormIpdOverallFindingResult = async (data) =>
    await pm.form_ipd_overall_finding_results.findFirst({ where: data })

exports.FetchOneRSTOnReviewStatus = async (data) =>
    await pm.review_status.findFirst({ where: data, select: { review_status_type: true } })

exports.CheckUniqueFormIpdReviewStatusResult = async (data) =>
    await pm.form_ipd_review_status_results.findFirst({ where: data, select: { form_ipd_id: true } })
// Fetch End #################################################################################################################################

// Insert Start #################################################################################################################################
exports.InsertPatient = async (data) => await pm.patients.create({ data: { ...data } })

exports.InsertFormIpd = async (data) => await pm.form_ipds.create({ data: { ...data } })

exports.InsertFormIpdContentOfMedicalRecordResult = async (data) =>
    await pm.form_ipd_content_of_medical_record_results.createMany({ data: data })

exports.InsertFormIpdOverallFindingResult = async (data) =>
    await pm.form_ipd_overall_finding_results.createMany({ data: data })

exports.InsertFormIpdReviewStatusResult = async (data) =>
    await pm.form_ipd_review_status_results.create({ data: data })
// Insert End #################################################################################################################################

// Update Start #################################################################################################################################
exports.UpdateFormIpdContentOfMedicalRecordResult = async (row, formIpdId) => {
    // เตรียม payload ตัด field ที่อาจเป็น undefined ออก
    const data = {
        na: row.na,
        missing: row.missing,
        no: row.no,
        criterion_number_1: row.criterion_number_1,
        criterion_number_2: row.criterion_number_2,
        criterion_number_3: row.criterion_number_3,
        criterion_number_4: row.criterion_number_4,
        criterion_number_5: row.criterion_number_5,
        criterion_number_6: row.criterion_number_6,
        criterion_number_7: row.criterion_number_7,
        criterion_number_8: row.criterion_number_8,
        criterion_number_9: row.criterion_number_9,
        point_deducted: row.point_deducted,
        total_score: row.total_score,
        comment: row.comment,
        updated_by: row.updated_by,
    }

    // ลบ key ที่เป็น undefined
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
    return pm.form_ipd_content_of_medical_record_results.update({
        where: {
            form_ipd_id: formIpdId,
            content_of_medical_record_id: row.content_of_medical_record_id,
            form_ipd_content_of_medical_record_result_id: row.form_ipd_content_of_medical_record_result_id,
        },
        data: data,
    })
}

exports.UpdateFormIpdOverallFindingResult = async (row, formIpdId) => {
    const data = {
        overall_finding_result: row.overall_finding_result,
        updated_by: row.updated_by,
    }

    // ลบ key ที่เป็น undefined
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k])

    return pm.form_ipd_overall_finding_results.update({
        where: {
            form_ipd_id: formIpdId,
            overall_finding_id: row.overall_finding_id,
            form_ipd_overall_finding_result_id: row.form_ipd_overall_finding_result_id,
        },
        data,
    })
}
// Update End #################################################################################################################################