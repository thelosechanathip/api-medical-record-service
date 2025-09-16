const { msg } = require('../../services/message.service')
const { setLog } = require('../../services/setLog.service')
const mraM = require('./mra.model') // mraM = mra model

// Function สำหรับจัดการข้อมูลเมื่อ insert ไม่สําเร็จ
exports.cleanupFailInsert = async (...args) => {
    const [an, formIpdId] = args
    await mraM.removeFormIpdReviewStatusResult(formIpdId)
    await mraM.removeFormIpdOverallFindingResult(formIpdId)
    await mraM.removeFormIpdContentOfMedicalRecordResult(formIpdId)
    await mraM.removeFormIpd(formIpdId)
    await mraM.removePatient(an)
}