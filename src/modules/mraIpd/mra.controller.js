const { msg } = require('../../services/message.service')
const { setLog } = require('../../services/setLog.service')
const mraM = require('./mra.model') // mraM = mra model

// Function สำหรับจัดการข้อมูลเมื่อ insert ไม่สําเร็จ
exports.cleanupFailInsert = async (...args) => {
    const [an, formIpdId] = args
    await mraM.RemoveFormIpdReviewStatusResult(formIpdId)
    await mraM.RemoveFormIpdOverallFindingResult(formIpdId)
    await mraM.RemoveFormIpdContentOfMedicalRecordResult(formIpdId)
    await mraM.RemoveFormIpd(formIpdId)
    await mraM.RemovePatient(an)
}

exports.generateForm = async (req, res) => {
    const mraD = req.body
    const ps = await mraM.FetchOnePatientService()

    try {
        const fh = await mraM.FetchHcode()
        const fullnamePayload = {
            created_by: req.fullname,
            updated_by: req.fullname
        }

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(mraD).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (['patient_an'].includes(key) && !value) hasEmptyValue = true

                if (['patient_an'].includes(key) && value) {
                    const fpim = await mraM.FetchPatientInMra(key, value)
                    if (fpim) {
                        const formData = await mraM.FetchOneFormIpdIdByPatientId(fpim.patient_id)
                        const formIRSR = await mraM.FetchFormIRSRInMra(formData.form_ipd_id)

                        if (formIRSR) {
                            duplicateStatus.push(409)
                            duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบที่สมบูรณ์แล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                        } else if (formIRSR === null || formIRSR === '') {
                            const result = await mraM.FetchOneData(fpim.patient_id)
                            return msg(res, 200, { data: result })
                        }
                    }
                }
            })
        )

        // ถ้ามีค่าที่ว่าง ให้เพิ่มข้อความแค่ครั้งเดียว
        if (hasEmptyValue) {
            duplicateMessage.unshift("กรุณากรอกข้อมูลให้ครบถ้วน!")
            return msg(res, 400, { message: duplicateMessage[0] })
        }

        // ถ้ามีข้อมูลซ้ำหรือค่าที่ว่าง ให้ส่ง response กลับครั้งเดียว
        if (duplicateMessage.length > 0) return msg(res, Math.max(...duplicateStatus), { message: duplicateMessage.join(" AND ") })

        const fpih = await mraM.FetchPatientInHos(mraD.patient_an)

        const pPayload = {
            hcode_id: fh.hcode_id,
            patient_fullname: fpih.fullname,
            patient_hn: fpih.hn,
            patient_vn: fpih.vn,
            patient_an: fpih.an,
            patient_ward: fpih.ward_name,
            patient_date_service: fpih.vstdate,
            patient_date_admitted: fpih.regdate,
            patient_date_discharged: fpih.dchdate,
            ...fullnamePayload
        }

        const startTime = Date.now()
        const ip = await mraM.InsertPatient(pPayload)
        if (ip) {
            const fiPayload = {
                patient_id: ip.patient_id,
                ...fullnamePayload
            }

            const ifi = await mraM.InsertFormIpd(fiPayload)
            if (ifi) {
                const fcomri = await mraM.FetchContentOfMedicalRecordById(ps.patient_service_id)
                console.log(fcomri)
            }
        }

        return msg(res, 200, { message: ip })
    } catch (err) {
        console.log('generateForm : ', err)
        return msg(res, 500, { message: err.message })
    }
}