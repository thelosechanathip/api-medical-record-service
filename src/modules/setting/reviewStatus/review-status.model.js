const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.review_status_logs.create({ data: data })

exports.FetchAllReviewStatus = async () => await pm.review_status.findMany()

exports.CheckUnique = async (key, value) => await pm.review_status.findFirst({ where: { [key]: value } })

exports.CheckPatientServiceId = async (ptsId) => await pm.patient_services.findFirst({ where: { patient_service_id: ptsId } })

exports.InsertReviewStatus = async (data) => await pm.review_status.create({ data: data })

exports.FetchOneReviewStatusById = async (id) => await pm.review_status.findFirst({ where: { review_status_id: id } })

exports.UpdateReviewStatus = async (id, data) => await pm.review_status.update({ where: { review_status_id: id }, data: data })

exports.RemoveReviewStatus = async (id) => await pm.review_status.delete({ where: { review_status_id: id } })