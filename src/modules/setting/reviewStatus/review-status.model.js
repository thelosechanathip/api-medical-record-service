const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.review_status_logs.create({ data: data })

exports.FetchAllReviewStatus = async () => await pm.review_status.findMany({
    include: {
        patient_services: true
    },
    orderBy: [
        { patient_service_id: 'asc' },
        { priority: 'asc' }
    ]
})

exports.CheckUnique = async (data) => await pm.review_status.findFirst({ where: data })

exports.CheckPatientServiceId = async (data) => await pm.patient_services.findFirst({ where: data })

exports.CheckPriority = async (data) => await pm.review_status.findFirst({ where: data, orderBy: { priority: 'desc' } })

exports.InsertReviewStatus = async (data) => await pm.review_status.create({ data: data })

exports.FetchOneReviewStatusById = async (id) => await pm.review_status.findFirst({ where: id })

exports.FetchOneReviewStatusNotByReviewStatusId = async (review_status_id, review_status_name, patient_service_id) =>
    await pm.review_status.findMany({
        where: {
            review_status_id: { not: review_status_id },
            review_status_name: review_status_name,
            patient_service_id: patient_service_id
        }
    })

exports.UpdateReviewStatus = async (id, data) => await pm.review_status.update({ where: id, data: data })

exports.CheckForeignKey = async () => {
    return await pm.$queryRaw`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'review_status'
        AND REFERENCED_COLUMN_NAME = 'review_status_id'
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

exports.RemoveReviewStatus = async (id) => await pm.review_status.delete({ where: id })