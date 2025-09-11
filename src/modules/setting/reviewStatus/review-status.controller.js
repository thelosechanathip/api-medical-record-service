const { cp } = require('fs')
const { msg } = require('../../../services/message.service')
const { setLog } = require('../../../services/setLog.service')
const rstm = require('./review-status.model') // rstm = review status model

// Function FetchAll
exports.FetchAllReviewStatus = async (req, res) => {
    try {
        const startTime = Date.now()
        const fars = await rstm.FetchAllReviewStatus() // fapts = fetch all review status
        if (fars.length === 0) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const setLog = setLog(req, req.fullname, endTime, fars)
        await rstm.InsertLog(setLog)

        return msg(res, 200, { message: "Fetch all data successfully!", data: fars })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Function Insert
exports.InsertReviewStatus = async (req, res) => {
    try {
        const rstd = req.body

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(rstd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value && key !== 'review_status_type') hasEmptyValue = true

                // ตรวจสอบค่าซ้ำเฉพาะ field ที่ไม่ว่าง
                if (value && key === 'review_status_name') {
                    const cu = await rstm.CheckUnique(key, value) // cu = CheckUnique
                    if (cu) {
                        duplicateStatus.push(409)
                        duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                    }
                }

                if (value && key === 'patient_service_id') {
                    const cptsi = await rstm.CheckPatientServiceId(value) // cptsi = check patient service id
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

        rstd.created_by = req.fullname
        rstd.updated_by = req.fullname

        const startTime = Date.now()
        const irst = await rstm.InsertReviewStatus(rstd) // irst = insert review status
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const setLog = setLog(req, req.fullname, endTime, irst)
        await rstm.InsertLog(setLog)

        return msg(res, 200, { message: 'Created successfully!' })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Function FetchOne
exports.FetchOneReviewStatusById = async (req, res) => {
    try {
        const rstId = req.params.rstId // rstId = review status id

        const startTime = Date.now() 
        const forstbi = await rstm.FetchOneReviewStatusById(rstId) // forstbi = fetch one review status by id
        if (!forstbi) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const setLog = setLog(req, req.fullname, endTime, forstbi)
        await rstm.InsertLog(setLog)

        return msg(res, 200, { data: forstbi })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Function Update
exports.UpdateReviewStatus = async (req, res) => {
    try {
        const rstId = req.params.rstId // rstId = review status id
        const forstbi = await rstm.FetchOneReviewStatusById(rstId) // forstbi = fetch one review status by id
        if (!forstbi) return msg(res, 404, { message: 'Data not found!' })

        const rstd = req.body

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(rstd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value && key !== 'review_status_type') hasEmptyValue = true

                // ตรวจสอบค่าซ้ำเฉพาะ field ที่ไม่ว่าง
                if (value && key === 'review_status_name') {
                    const cu = await rstm.CheckUnique(key, value) // cu = CheckUnique
                    if (cu) {
                        duplicateStatus.push(409)
                        duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                    }
                }

                if (value && key === 'patient_service_id') {
                    const cptsi = await rstm.CheckPatientServiceId(value) // cptsi = check patient service id
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

        rstd.updated_by = req.fullname

        const startTime = Date.now()
        const urst = await rstm.UpdateReviewStatus(rstId, rstd) // urst = update review status
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const setLog = setLog(req, req.fullname, endTime, urst)
        await rstm.InsertLog(setLog)

        return msg(res, 200, { message: 'Updated successfully!' })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Function Delete
exports.RemoveReviewStatus = async (req, res) => {
    try {
        const rstId = req.params.rstId // rstId = review status id
        const forstbi = await rstm.FetchOneReviewStatusById(rstId) // forstbi = fetch one review status by id
        if (!forstbi) return msg(res, 404, { message: 'Data not found!' })

        const startTime = Date.now()
        const rrst = await rstm.RemoveReviewStatus(rstId) // rrst = remove review status
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, rrst)
        await rstm.InsertLog(sl)

        return msg(res, 200, { message: 'Removed successfully!' })
    } catch (err) {
        throw new Error(err.message)
    }
}