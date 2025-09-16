const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.overall_finding_logs.create({ data: data })

exports.FetchAllOverallFinding = async () => await pm.overall_finding.findMany()

// exports.CheckUnique = async (key, value) => await pm.content_of_medical_records.findFirst({ where: { [key]: value } })

exports.CheckPatientServiceId = async (key, value) => await pm.patient_services.findFirst({ where: { [key]: value } })

exports.InsertOverallFinding = async (data) => await pm.overall_finding.create({ data: data })

exports.FetchOneOverallFindingById = async (id) => await pm.overall_finding.findFirst({ where: { overall_finding_id: id } })

exports.UpdateOverallFinding = async (id, data) => await pm.overall_finding.update({ where: { overall_finding_id: id }, data: data })

exports.RemoveOverallFinding = async (id) => await pm.overall_finding.delete({ where: { overall_finding_id: id } })