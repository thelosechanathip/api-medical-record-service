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

exports.UpdateReviewStatus = async (id, data) => await pm.review_status.update({ where: id, data: data })

exports.RemoveReviewStatus = async (id) => await pm.review_status.delete({ where: id })