const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.content_of_medical_record_logs.create({ data: data })

exports.FetchAllContentOfMedicalRecords = async () => await pm.content_of_medical_records.findMany({
    include: {
        patient_services: true
    },
    orderBy: [ { priority: 'asc' }, { patient_services: { patient_service_name_english: 'asc' } } ]
})

exports.CheckUnique = async (data) => await pm.content_of_medical_records.findFirst({ where: data })

exports.CheckPatientServiceId = async (data) => await pm.patient_services.findFirst({ where: data })

exports.CheckPriority = async (data) =>
    await pm.content_of_medical_records.findFirst({ where: data, orderBy: { priority: 'desc' } })

exports.InsertContentOfMedicalRecord = async (data) => await pm.content_of_medical_records.create({ data: data })

exports.FetchOneContentOfMedicalRecordById = async (id) =>
    await pm.content_of_medical_records.findFirst({
        where: id,
        include: {
            patient_service_id: false,
            patient_services: true
        }
    })

exports.UpdateContentOfMedicalRecord = async (id, data) =>
    await pm.content_of_medical_records.update({ where: id, data: data })

exports.CheckForeignKey = async () => {
    return await pm.$queryRaw`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'content_of_medical_records'
        AND REFERENCED_COLUMN_NAME = 'content_of_medical_record_id'
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

exports.RemoveContentOfMedicalRecord = async (id) =>
    await pm.content_of_medical_records.delete({ where: id })