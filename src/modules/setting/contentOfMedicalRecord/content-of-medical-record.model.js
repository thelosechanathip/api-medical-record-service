const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.content_of_medical_record_logs.create({ data: data })

exports.FetchAllContentOfMedicalRecords = async () => await pm.content_of_medical_records.findMany({
    include: {
        patient_service_id: false,
        patient_services: true
    }
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

exports.RemoveContentOfMedicalRecord = async (id) =>
    await pm.content_of_medical_records.delete({ where: id })