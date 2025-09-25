const pm = require('../../libs/prisma')

exports.CountAll = async () => await pm.form_ipds.count()

exports.CountFormIpdByWard = async () => {
    const rows = await pm.$queryRaw`
        SELECT 
            COUNT(patient_ward) AS result,
            pt.patient_ward
        FROM form_ipds AS fi
        LEFT OUTER JOIN patients AS pt ON fi.patient_id = pt.patient_id
        GROUP BY pt.patient_ward
    `

    return rows.map(r => ({
        ...r,
        result: Number(r.result)
    }))
}

exports.CountDistinctFormIpdByService = async () => {
    const rows = await pm.$queryRaw`
        SELECT
            COUNT(DISTINCT fi.form_ipd_id) AS result,
            pts.patient_service_name_english
        FROM form_ipds AS fi
        LEFT OUTER JOIN form_ipd_content_of_medical_record_results AS ficomrr ON fi.form_ipd_id = ficomrr.form_ipd_id
        LEFT OUTER JOIN content_of_medical_records AS comr ON ficomrr.content_of_medical_record_id = comr.content_of_medical_record_id
        LEFT OUTER JOIN patient_services AS pts ON comr.patient_service_id = pts.patient_service_id
        GROUP BY pts.patient_service_id, pts.patient_service_name_english
    `
    return rows.map(r => ({
        ...r,
        result: Number(r.result)
    }))
}

exports.FetchAnByWard = async (ward) =>
    await pm.patients.findMany({ where: { patient_ward: ward, patient_an: { not: null } }, select: { patient_an: true, patient_id: true } })

exports.FetchFormIpdByPatientId = async (patient_id) =>
    await pm.form_ipds.findFirst({ where: { patient_id: patient_id } })