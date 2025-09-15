const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.content_of_medical_record_logs.create({ data: data })

exports.FetchAllContentOfMedicalRecords = async () => await pm.content_of_medical_records.findMany()

exports.CheckUnique = async (key, value) => await pm.content_of_medical_records.findFirst({ where: { [key]: value } })

exports.CheckPatientServiceId = async (key, value) => await pm.patient_services.findFirst({ where: { [key]: value } })

exports.InsertContentOfMedicalRecord = async (data) => await pm.content_of_medical_records.create({ data: data })

exports.FetchOneContentOfMedicalRecordById = async (id) =>
    await pm.content_of_medical_records.findFirst({ where: { content_of_medical_record_id: id } })

exports.UpdateContentOfMedicalRecord = async (id, data) =>
    await pm.content_of_medical_records.update({ where: { content_of_medical_record_id: id }, data: data })

exports.RemoveContentOfMedicalRecord = async (id) =>
    await pm.content_of_medical_records.delete({ where: { content_of_medical_record_id: id } })