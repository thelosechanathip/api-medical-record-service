const pm = require('../../libs/prisma')
const db_h = require('../../libs/db_h')

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

exports.InsertLog = async (data) => await pm.content_of_medical_record_logs.create({ data: data })

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
        select: { content_of_medical_record_id: true, content_of_medical_record_name: true },
        orderBy: { created_at: 'asc' }
    })
}
// Fetch End #################################################################################################################################

// Insert Start #################################################################################################################################
exports.InsertPatient = async (data) => await pm.patients.create({ data: { ...data } })

exports.InsertFormIpd = async (data) => await pm.form_ipds.create({ data: { ...data } })
// Insert End #################################################################################################################################