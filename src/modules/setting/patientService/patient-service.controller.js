const { msg } = require('../../../services/message.service')
const { setLog } = require('../../../services/setLog.service')
const psm = require('./patient-service.model')

/* 
    นิยามตัวย่อ:
        psm = patient service model
        psd = patient service data
        rd = result data
        sl = set log
        st = start time
        et = end time
*/

// Retrieve all data from the patient_services table(ดึงข้อมูลทั้งหมดจากตาราง patient_services)
exports.fetchAllPatientServices = async (req, res) => {
    try {
        const st = Date.now()
        const rd = await psm.fetchAllPatientServices()
        const et = Date.now() - st

        // Set and Insert Log
        const sl = setLog(req, "Chanathip", et, rd)
        await psm.insertLog(sl)

        return msg(res, 200, { message: "Fetch all data successfully!", data: rd })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Save data to the patient_services table(บันทึกข้อมูลลงตาราง patient_services)
exports.createPatientService = async (req, res) => {
    try {
        const psd = req.body
        const fullname = "Administrator"

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const deplicateStatus = []
        const duplicateMessages = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(psd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value) hasEmptyValue = true

                // ตรวจสอบค่าซ้ำเฉพาะ field ที่ไม่ว่าง
                if (value) {
                    const existingRecord = await psm.findFirstPatientService(key, value)
                    if (existingRecord) {
                        deplicateStatus.push(409)
                        duplicateMessages.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                    }
                }
            })
        )

        // ถ้ามีค่าที่ว่าง ให้เพิ่มข้อความแค่ครั้งเดียว
        if (hasEmptyValue) {
            duplicateMessages.unshift("กรุณากรอกข้อมูลให้ครบถ้วน!")
            return msg(res, 400, { message: duplicateMessages[0] })
        }

        // ถ้ามีข้อมูลซ้ำหรือค่าที่ว่าง ให้ส่ง response กลับครั้งเดียว
        if (duplicateMessages.length > 0) return msg(res, Math.max(...deplicateStatus), { message: duplicateMessages.join(" AND ") })

        psd.created_by = fullname
        psd.updated_by = fullname

        const st = Date.now()
        console.log(psd)
        // const rd = await psm.createPatientService(psd)
        // const et = Date.now() - st

        // // Set and Insert Log
        // const sl = setLog(req, fullname, et, rd)
        // await psm.insertLog(sl)

        return msg(res, 200, { message: 'Created successfully!' })
    } catch (err) {
        throw new Error(err.message)
    }
}