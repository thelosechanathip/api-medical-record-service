const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.overall_finding_logs.create({ data: data })

exports.FetchAllOverallFinding = async () => await pm.overall_finding.findMany({
    include: {
        patient_services: true
    },
    orderBy: [
        { patient_service_id: 'asc' },
        { priority: 'asc' }
    ]
})

exports.CheckUnique = async (data) => await pm.overall_finding.findFirst({ where: data })

exports.CheckPatientServiceId = async (data) => await pm.patient_services.findFirst({ where: data })

exports.CheckPriority = async (data) =>
    await pm.overall_finding.findFirst({ where: data, orderBy: { priority: 'desc' } })

exports.InsertOverallFinding = async (data) => await pm.overall_finding.create({ data: data })

exports.FetchOneOverallFindingById = async (id) => await pm.overall_finding.findFirst({ where: id })

exports.FetchOneOverallFindingNotByOverallFindingId = async (overall_finding_id, overall_finding_name, patient_service_id) =>
    await pm.overall_finding.findMany({
        where: {
            overall_finding_id: { not: overall_finding_id },
            overall_finding_name: overall_finding_name,
            patient_service_id: patient_service_id,
        }
    })

exports.UpdateOverallFinding = async (id, data) => await pm.overall_finding.update({ where: id, data: data })

exports.CheckForeignKey = async () => {
    return await pm.$queryRaw`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'overall_finding'
        AND REFERENCED_COLUMN_NAME = 'overall_finding_id'
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

exports.RemoveOverallFinding = async (id) => await pm.overall_finding.delete({ where: id })