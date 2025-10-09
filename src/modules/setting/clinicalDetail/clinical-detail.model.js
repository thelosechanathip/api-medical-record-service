const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.clinical_details_logs.create({ data: data })

exports.FetchAllClinicalDetails = async () => await pm.clinical_details.findMany({
    include: {
        patient_services: true
    },
    orderBy: [
        { patient_service_id: 'asc' },
        { priority: 'asc' }
    ]
})

exports.CheckPatientServiceId = async (data) => await pm.patient_services.findFirst({ where: data })

exports.CheckUnique = async (data) => await pm.clinical_details.findFirst({ where: data })

exports.CheckPriority = async (data) =>
    await pm.clinical_details.findFirst({ where: data, orderBy: { priority: 'desc' } })

exports.InsertClinicalDetail = async (data) => await pm.clinical_details.create({ data: data })

exports.FetchOneClinicalDetailById = async (id) => await pm.clinical_details.findFirst({ where: { clinical_detail_id: id } })

exports.FetchOneClinicalDetailNotByClinicalDetailId = async (clinical_detail_id, clinical_detail_name, patient_service_id) =>
    await pm.clinical_details.findMany({
        where: {
            clinical_detail_id: { not: clinical_detail_id },
            clinical_detail_name: clinical_detail_name,
            patient_service_id: patient_service_id,
        }
    })

exports.UpdateClinicalDetail = async (id, data) => await pm.clinical_details.update({ where: { clinical_detail_id: id }, data: data })

exports.CheckForeignKey = async () => {
    return await pm.$queryRaw`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'clinical_details'
        AND REFERENCED_COLUMN_NAME = 'clinical_detail_id'
        AND EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = KEY_COLUMN_USAGE.TABLE_NAME
        )
    `
}

exports.CheckForeignKeyData = async (tableName, columnName, id) => {
    return await pm.$queryRawUnsafe(`
        SELECT 1 FROM ${tableName} WHERE ${columnName} = "${id}" LIMIT 1
    `)
}

exports.RemoveClinicalDetail = async (id) => await pm.clinical_details.delete({ where: { clinical_detail_id: id } })