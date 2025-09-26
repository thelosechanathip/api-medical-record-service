const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.patient_service_logs.create({ data: data })

exports.FetchAllPatientServices = async () => await pm.patient_services.findMany({ orderBy: { priority: 'asc' } })

exports.FindFirstPatientService = async (key, value) => await pm.patient_services.findFirst({ where: { [key]: value } })

exports.CreatePatientService = async (data) => await pm.patient_services.create({ data: data })

exports.FetchOnePatientServiceById = async (ptsId) => await pm.patient_services.findFirst({ where: { patient_service_id: ptsId } })

exports.CheckPriority = async () => await pm.patient_services.findFirst({ orderBy: { priority: 'desc' } })

exports.FetchOnePatientServiceNotByPatientServiceId = async (patient_service_id, patient_service_name_thai, patient_service_name_english) =>
    await pm.patient_services.findMany({
        where: {
            patient_service_id: { not: patient_service_id },
            OR: [
                { patient_service_name_english: patient_service_name_english },
                { patient_service_name_thai: patient_service_name_thai }
            ]
        }
    })

exports.UpdatePatientService = async (ptsId, data) => await pm.patient_services.update({ where: { patient_service_id: ptsId }, data: data })

exports.CheckForeignKey = async () => {
    return await pm.$queryRaw`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'patient_services'
        AND REFERENCED_COLUMN_NAME = 'patient_service_id'
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

exports.RemovePatientService = async (ptsId) => await pm.patient_services.delete({ where: { patient_service_id: ptsId } })