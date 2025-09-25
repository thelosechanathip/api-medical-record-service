const pm = require('../../libs/prisma')
const db_h = require('../../libs/db_h')
const db_b = require('../../libs/db_b')

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

// บันทึกข้อมูลการทำงานของ form_ipds
exports.InsertLog = async (data) => await pm.form_ipd_logs.create({ data: data })

// Remove Start #################################################################################################################################
// Remove ข้อมูล form_ipd_review_status_results จำนวนหลาย record อ้างอิงจาก form_ipd_id
exports.RemoveFormIpdReviewStatusResult = async (form_ipd_id) =>
    await pm.form_ipd_review_status_results.deleteMany({ where: { form_ipd_id: form_ipd_id } })

// Remove ข้อมูล form_ipd_overall_finding_results จำนวนหลาย record อ้างอิงจาก form_ipd_id
exports.RemoveFormIpdOverallFindingResult = async (form_ipd_id) =>
    await pm.form_ipd_overall_finding_results.deleteMany({ where: { form_ipd_id: form_ipd_id } })

// Remove ข้อมูล form_ipd_content_of_medical_record_results จำนวนหลาย record อ้างอิงจาก form_ipd_id
exports.RemoveFormIpdContentOfMedicalRecordResult = async (form_ipd_id) =>
    await pm.form_ipd_content_of_medical_record_results.deleteMany({ where: { form_ipd_id: form_ipd_id } })

// Remove ข้อมูล form_ipds จำนวน 1 record อ้างอิงจาก form_ipd_id
exports.RemoveFormIpd = async (form_ipd_id) =>
    await pm.form_ipds.delete({ where: { form_ipd_id: form_ipd_id } })

// Remove ข้อมูล patients จำนวน 1 record อ้างอิงจาก patient_an และส่งค่า patient_id ที่ลบแล้วกลับคืน
exports.RemovePatient = async (patient_an) =>
    await pm.patients.delete({ where: { patient_an: patient_an }, select: { patient_id: true } })
// Remove End #################################################################################################################################

// Fetch Start #################################################################################################################################
// ดึงข้อมูล hcode_id จำนวน 1 record จากตาราง hcodes
exports.FetchHcode = async () => await pm.hcodes.findFirst({ select: { hcode_id: true } })

// ดึงข้อมูล patient_service_id จำนวน 1 record จากตาราง patient_services อ้างอิงจาก patient_service_name_english
exports.FetchOnePatientService = async () =>
    await pm.patient_services.findFirst({ select: { patient_service_id: true }, where: { patient_service_name_english: 'IPD' } })

// ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_an
exports.FetchPatientInMra = async (patient_an) =>
    await pm.patients.findFirst({ where: { patient_an: patient_an }, select: { patient_id: true } })

// ดึงข้อมูล form_ipd_id จำนวน 1 record จากตาราง form_ipds อ้างอิงจาก patient_id
exports.FetchOneFormIpdIdByPatientId = async (patient_id) =>
    await pm.form_ipds.findFirst({ where: { patient_id: patient_id }, select: { form_ipd_id: true } })

// ดึงข้อมูล review_status_id จำนวน 1 record จากตาราง form_ipd_review_status_results อ้างอิงจาก form_ipd_id
exports.FetchFormIRSRInMra = async (form_ipd_id) => {
    return await pm.form_ipd_review_status_results.findFirst({
        where: { form_ipd_id: form_ipd_id },
        select: { review_status_id: true }
    })
}

/*
    ดึงข้อมูลทั้งหมดของตาราง form_ipds
    join
        patients, form_ipd_content_of_medical_record_results, form_ipd_overall_finding_results, form_ipd_review_status_results
*/
exports.FetchAllMedicalRecordAuditIPD = async () => {
    return await pm.form_ipds.findMany({
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
                    content_of_medical_records: {
                        select: {
                            content_of_medical_record_id: true,
                            content_of_medical_record_name: true
                        }
                    }
                }
            },
            form_ipd_overall_finding_results: {
                include: {
                    overall_finding_id: false,
                    overall_finding: {
                        select: {
                            overall_finding_id: true,
                            overall_finding_name: true
                        }
                    }
                }
            },
            form_ipd_review_status_results: {
                include: {
                    review_status_id: false,
                    review_status: {
                        select: {
                            review_status_id: true,
                            review_status_name: true
                        }
                    }
                }
            }
        }
    })
}

/*
    ดึงข้อมูลทั้งหมดของตาราง form_ipds
    join
        patients, form_ipd_content_of_medical_record_results, form_ipd_overall_finding_results, form_ipd_review_status_results
    อ้างอิงจาก
        patient_id
*/
exports.FetchOneMedicalRecordAuditIPD = async (patient_id) => {
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
                },
                orderBy: {
                    content_of_medical_records: { priority: 'asc' }
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

// ดึงข้อมูล คนไข้ จำนวน 1 record มาจากระบบ HOSxP อ้างอิงจาก patient_an
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
            LIMIT 1
        `, [patient_an]
    )
    return pickFirst(rows)
}

/*
    ดึงข้อมูล
        content_of_medical_record_name, criterion_number_1-9_type
    จากตาราง
        content_of_medical_records
    อ้างอิงจาก
        content_of_medical_record_id
*/
exports.FetchOneContentOfMedicalRecordById = async (content_of_medical_record_id, data) =>
    await pm.content_of_medical_records.findFirst({
        where: { content_of_medical_record_id: content_of_medical_record_id, },
        select: { [data]: true, content_of_medical_record_name: true }
    })

// ดึงข้อมูลทั้งหมด content_of_medical_record_id จากตาราง content_of_medical_records อ้างอิงจาก patient_service_id และเรียงลำดับจากน้อยไปมากโดยอ้างอิง priority
exports.FetchContentOfMedicalRecordByPatientId = async (patient_service_id) => {
    return await pm.content_of_medical_records.findMany({
        where: { patient_service_id: patient_service_id },
        select: { content_of_medical_record_id: true },
        orderBy: { priority: 'asc' }
    })
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

// ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_an
exports.FetchAnInPatient = async (patient_an) =>
    await pm.patients.findFirst({ where: { patient_an: patient_an }, select: { patient_id: true } })

// ดึงข้อมูล form_ipd_id จำนวน 1 record จากตาราง form_ipds อ้างอิงจาก patient_id
exports.FetchPatientIdInFormIpd = async (patient_id) =>
    await pm.form_ipds.findFirst({ where: { patient_id: patient_id }, select: { form_ipd_id: true } })

// ดึงข้อมูลทั้งหมด overall_finding_id จากตาราง overall_finding อ้างอิงจาก patient_service_id และเรียงลำดับจากน้อยไปมากโดยอ้างอิง priority
exports.FetchOverallFindingByPatientId = async (patient_service_id) => {
    return await pm.overall_finding.findMany({
        where: { patient_service_id: patient_service_id },
        select: { overall_finding_id: true },
        orderBy: { priority: 'asc' }
    })
}

/*
    ดึงข้อมูล 1 record จากตาราง form_ipd_content_of_medical_record_results
    อ้างอิงจาก
        form_ipd_content_of_medical_record_result_id, content_of_medical_record_id
*/
exports.FetchOneFormIpdContentOfMedicalRecordResult = async (form_ipd_content_of_medical_record_result_id, content_of_medical_record_id) =>
    await pm.form_ipd_content_of_medical_record_results.findFirst({
        where: {
            form_ipd_content_of_medical_record_result_id: form_ipd_content_of_medical_record_result_id,
            content_of_medical_record_id: content_of_medical_record_id
        }
    })

/*
    ดึงข้อมูล 1 record จากตาราง form_ipd_overall_finding_results
    อ้างอิงจาก
        form_ipd_overall_finding_result_id, overall_finding_id
*/
exports.FetchOneFormIpdOverallFindingResult = async (form_ipd_overall_finding_result_id, overall_finding_id) =>
    await pm.form_ipd_overall_finding_results.findFirst({
        where: {
            form_ipd_overall_finding_result_id: form_ipd_overall_finding_result_id,
            overall_finding_id: overall_finding_id
        }
    })

// ดึงข้อมูล review_status_type จำนวน 1 record จากตาราง review_status อ้างอิงจาก review_status_id
exports.FetchOneRSTOnReviewStatus = async (review_status_id) =>
    await pm.review_status.findFirst({ where: { review_status_id: review_status_id }, select: { review_status_type: true } })

// ดึงข้อมูล form_ipd_id จำนวน 1 record จากตาราง form_ipd_review_status_results อ้างอิงจาก form_ipd_id
exports.CheckUniqueFormIpdReviewStatusResult = async (form_ipd_id) =>
    await pm.form_ipd_review_status_results.findFirst({ where: { form_ipd_id: form_ipd_id }, select: { form_ipd_id: true } })

// ดึงข้อมูล 1 record จากตาราง content_of_medical_records อ้างอิงจาก content_of_medical_record_id
exports.FetchTypeContentOfMedicalRecordById = async (content_of_medical_record_id) =>
    await pm.content_of_medical_records.findFirst({ where: { content_of_medical_record_id: content_of_medical_record_id } })

exports.FetchOneReviewStatusByPatientServiceId = async (patient_service_id) =>
    await pm.review_status.findMany({ where: { patient_service_id: patient_service_id }, orderBy: { priority: 'asc' } })

exports.FetchAnByFormIpdId = async (form_ipd_id) =>
    await pm.form_ipds.findFirst({
        where: { form_ipd_id: form_ipd_id },
        select: {
            patients: {
                select: { patient_an: true }
            }
        }
    })

exports.FetchOnePdfByFormIpdId = async (form_ipd_id) =>
    await pm.pdf.findFirst({ where: { form_ipd_id: form_ipd_id } })
// Fetch End #################################################################################################################################

// Insert Start #################################################################################################################################
// บันทึกข้อมูลไปยังตาราง patients
exports.InsertPatient = async (data) => await pm.patients.create({ data: { ...data } })

// บันทึกข้อมูลไปยังตาราง form_ipds
exports.InsertFormIpd = async (data) => await pm.form_ipds.create({ data: { ...data } })

// บันทึกข้อมูลไปยังตาราง form_ipd_content_of_medical_record_results แบบหลาย record พร้อมกัน
exports.InsertFormIpdContentOfMedicalRecordResult = async (data) =>
    await pm.form_ipd_content_of_medical_record_results.createMany({ data: data })

// บันทึกข้อมูลไปยังตาราง form_ipd_overall_finding_results แบบหลาย record พร้อมกัน
exports.InsertFormIpdOverallFindingResult = async (data) =>
    await pm.form_ipd_overall_finding_results.createMany({ data: data })

// บันทึกข้อมูลไปยังตาราง form_ipd_review_status_results
exports.InsertFormIpdReviewStatusResult = async (data) =>
    await pm.form_ipd_review_status_results.create({ data: data })

exports.InsertPdf = async (data) => await pm.pdf.create({ data: data })
// Insert End #################################################################################################################################

// Update Start #################################################################################################################################
/*
    อัพเดทข้อมูลไปยังตาราง form_ipd_content_of_medical_record_results
    อ้างอิงจาก
        formIpdId, content_of_medical_record_id, form_ipd_content_of_medical_record_result_id
*/
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

/*
    อัพเดทข้อมูลไปยังตาราง form_ipd_overall_finding_results
    อ้างอิงจาก
        form_ipd_id, overall_finding_id, form_ipd_overall_finding_result_id
*/
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