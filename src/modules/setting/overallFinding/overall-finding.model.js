const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.overall_finding_logs.create({ data: data })

exports.FetchAllOverallFinding = async () => await pm.overall_finding.findMany()

exports.CheckUnique = async (data) => await pm.overall_finding.findFirst({ where: data })

exports.CheckPatientServiceId = async (data) => await pm.patient_services.findFirst({ where: data })

exports.CheckPriority = async (data) =>
    await pm.overall_finding.findFirst({ where: data, orderBy: { priority: 'desc' } })

exports.InsertOverallFinding = async (data) => await pm.overall_finding.create({ data: data })

exports.FetchOneOverallFindingById = async (id) => await pm.overall_finding.findFirst({ where: id })

exports.UpdateOverallFinding = async (id, data) => await pm.overall_finding.update({ where: id, data: data })

exports.RemoveOverallFinding = async (id) => await pm.overall_finding.delete({ where: id })