const { msg } = require('../../../services/message.service')
const { setLog } = require('../../../services/setLog.service')
const comrm = require('./content-of-medical-record.model') // comrm = content of medical record model

// Function FetchAll
exports.FetchAllContentOfMedicalRecords = async (req, res) => {
    try {
        const startTime = Date.now()
        const facomr = await comrm.FetchAllContentOfMedicalRecords() // facomr = fetch all content of medical records
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, facomr)
        await comrm.InsertLog(sl)

        if (facomr.length === 0) return msg(res, 404, { message: 'Data not found!' })
        return msg(res, 200, { message: "Fetch all data successfully!", data: facomr })
    } catch (err) {
        console.log('FetchAllContentOfMedicalRecords : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Insert
exports.InsertContentOfMedicalRecord = async (req, res) => {
    try {
        const comrd = req.body

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(comrd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value && key == 'content_of_medical_record_name') hasEmptyValue = true
                if (value && key == 'content_of_medical_record_name') {
                    const cu = await comrm.CheckUnique(key, value) // cu = CheckUnique
                    if (cu) {
                        duplicateStatus.push(409)
                        duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                    }
                }

                if (value && key == 'patient_service_id') {
                    const cptsi = await comrm.CheckPatientServiceId(key, value) // cptsi = check patient service id
                    if (!cptsi) {
                        duplicateStatus.push(404)
                        duplicateMessage.push(`ไม่มีข้อมูลคำระบุของกลุ่มคนไข้ที่เลือกมากรุณาตรวจสอบ!`)
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

        comrd.created_by = req.fullname
        comrd.updated_by = req.fullname

        const startTime = Date.now()
        const icomr = await comrm.InsertContentOfMedicalRecord(comrd)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, icomr)
        await comrm.InsertLog(sl)

        return msg(res, 200, { message: 'Created successfully!' })
    } catch (err) {
        console.log('InsertContentOfMedicalRecord : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function FetchOne
exports.FetchOneContentOfMedicalRecordById = async (req, res) => {
    try {
        const comrId = req.params.comrId // comrId = content of medical record id

        const startTime = Date.now()
        const focomr = await comrm.FetchOneContentOfMedicalRecordById(comrId) // focomr = fetch one content of medical record by id
        if (!focomr) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, focomr)
        await comrm.InsertLog(sl)

        return msg(res, 200, { data: focomr })
    } catch (err) {
        console.log('FetchOneContentOfMedicalRecordById : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Update
exports.UpdateContentOfMedicalRecord = async (req, res) => {
    try {
        const comrId = req.params.comrId // comrId = content of medical record id
        const focomr = await comrm.FetchOneContentOfMedicalRecordById(comrId) // focomr = fetch one content of medical record by id
        if (!focomr) return msg(res, 404, { message: 'Data not found!' })

        const comrd = req.body

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(comrd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value && key == 'content_of_medical_record_name') hasEmptyValue = true
                if (value && key == 'content_of_medical_record_name') {
                    const cu = await comrm.CheckUnique(key, value) // cu = CheckUnique
                    if (cu) {
                        duplicateStatus.push(409)
                        duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                    }
                }

                if (value && key == 'patient_service_id') {
                    const cptsi = await comrm.CheckPatientServiceId(key, value) // cptsi = check patient service id
                    if (!cptsi) {
                        duplicateStatus.push(404)
                        duplicateMessage.push(`ไม่มีข้อมูลคำระบุของกลุ่มคนไข้ที่เลือกมากรุณาตรวจสอบ!`)
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

        comrd.updated_by = req.fullname

        const startTime = Date.now()
        const ucomr = await comrm.UpdateContentOfMedicalRecord(comrId, comrd) // ucomr = update content of medical record
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, ucomr)
        await comrm.InsertLog(sl)

        return msg(res, 200, { message: 'Updated successfully!' })
    } catch (err) {
        console.log('UpdateContentOfMedicalRecord : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Delete
exports.RemoveContentOfMedicalRecord = async (req, res) => {
    try {
        const comrId = req.params.comrId // comrId = content of medical record id
        const focomr = await comrm.FetchOneContentOfMedicalRecordById(comrId) // focomr = fetch one content of medical record by id
        if (!focomr) return msg(res, 404, { message: 'Data not found!' })

        const startTime = Date.now()
        const rcomr = await comrm.RemoveContentOfMedicalRecord(comrId) // rcomr = remove content of medical record
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, rcomr)
        await comrm.InsertLog(sl)

        return msg(res, 200, { message: 'Removed successfully!' })
    } catch (err) {
        console.log('RemoveContentOfMedicalRecord : ', err)
        return msg(res, 500, { message: err.message })
    }
}