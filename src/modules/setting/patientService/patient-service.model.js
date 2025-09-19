const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.patient_service_logs.create({ data: data })

exports.FetchAllPatientServices = async () => await pm.patient_services.findMany()

exports.FindFirstPatientService = async (key, value) => await pm.patient_services.findFirst({ where: { [key]: value } })

exports.CreatePatientService = async (data) => await pm.patient_services.create({ data: data })

exports.FetchOnePatientServiceById = async (ptsId) => await pm.patient_services.findFirst({ where: { patient_service_id: ptsId } })

exports.CheckPriority = async () => await pm.patient_services.findFirst({ orderBy: { priority: 'desc' } })

exports.UpdatePatientService = async (ptsId, data) => await pm.patient_services.update({ where: { patient_service_id: ptsId }, data: data })

exports.RemovePatientService = async (ptsId) => await pm.patient_services.delete({ where: { patient_service_id: ptsId } })