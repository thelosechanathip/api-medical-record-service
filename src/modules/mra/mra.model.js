const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.content_of_medical_record_logs.create({ data: data })

// Remove Start
exports.removeFormIpdReviewStatusResult = async (form_ipd_id) => 
    await pm.form_ipd_review_status_results.deleteMany({ where: { form_ipd_id: Number(form_ipd_id) } })

exports.removeFormIpdOverallFindingResult = async (form_ipd_id) =>
    await pm.form_ipd_overall_finding_results.deleteMany({ where: { form_ipd_id: Number(form_ipd_id) } })

exports.removeFormIpdContentOfMedicalRecordResult = async (form_ipd_id) =>
    await pm.form_ipd_content_of_medical_record_results.deleteMany({ where: { form_ipd_id: Number(form_ipd_id) } })

exports.removeFormIpd = async (form_ipd_id) =>
    await pm.form_ipds.delete({ where: { form_ipd_id: form_ipd_id } })

exports.removePatient = async (an) =>
    await pm.patients.delete({ where: { patient_an: an }, select: { patient_id: true } })
// Remove End