const pm = require('../../libs/prisma')

exports.CountAll = async () => await pm.form_ipds.count()

exports.CountAllPercentageNotNull = async () => await pm.form_ipds.count({ where: { percentage: { not: null } } })
exports.CountAllPercentageNull = async () => await pm.form_ipds.count({ where: { percentage: null } })

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

exports.AveragePatientServiceNameEnglish = async () => {
    const rows = await pm.$queryRaw`
        SELECT 
            rs.patient_service_name_english,
            ROUND(AVG(fi.percentage), 2) AS average
        FROM (
            SELECT
                form_ipd_id,
                total_score,
                score_obtained,
                percentage
            FROM form_ipds
        ) AS fi
        LEFT OUTER JOIN (
            SELECT
                form_ipd_id,
                review_status_id
            FROM form_ipd_review_status_results
        ) AS firsr ON fi.form_ipd_id = firsr.form_ipd_id
        LEFT OUTER JOIN (
            SELECT
                rs.review_status_id,
                psv.patient_service_name_english
            FROM review_status rs
            LEFT OUTER JOIN patient_services AS psv ON rs.patient_service_id = psv.patient_service_id
        ) AS rs ON firsr.review_status_id = rs.review_status_id
        WHERE
            fi.total_score IS NOT NULL
            OR fi.score_obtained IS NOT NULL
            OR fi.percentage IS NOT NULL
    `
    return rows.map(r => ({
        ...r,
        average: Number(r.average)
    }))
}

exports.AverageWard = async () => {
    const rows = await pm.$queryRaw`
        SELECT 
            pt.patient_ward,
            ROUND(AVG(fi.percentage), 2) AS average
        FROM 
            form_ipds AS fi
            LEFT OUTER JOIN patients AS pt ON fi.patient_id = pt.patient_id
        WHERE 
            fi.total_score IS NOT NULL
            OR fi.score_obtained IS NOT NULL
            OR fi.percentage IS NOT NULL
        GROUP BY 
            pt.patient_ward
    `
    return rows.map(r => ({
        ...r,
        average: Number(r.average)
    }))
}

exports.AverageAll = async () => {
    const rows = await pm.$queryRaw`
        SELECT 
            ROUND(AVG(percentage), 2) AS average
        FROM 
            form_ipds
        WHERE 
            total_score IS NOT NULL
            AND score_obtained IS NOT NULL
            AND percentage IS NOT NULL
    `
    return rows.map(r => ({
        average: Number(r.average)
    }))
}

exports.FetchAnByWard = async (ward) =>
    await pm.patients.findMany({ where: { patient_ward: ward, patient_an: { not: null } }, select: { patient_an: true, patient_id: true } })

exports.FetchFormIpdByPatientId = async (patient_id) =>
    await pm.form_ipds.findFirst({ where: { patient_id: patient_id } })