const { msg } = require('../../../services/message.service')
const { setLog } = require('../../../services/setLog.service')
const ofm = require('./overall-finding.model') // ofm = overall finding model

// Function FetchAll
exports.FetchAllOverallFinding = async (req, res) => {
    try {
        const startTime = Date.now()
        const faof = await ofm.FetchAllOverallFinding() // faof = fetch all overall finding
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, faof)
        await ofm.InsertLog(sl)

        if (faof.length === 0) return msg(res, 404, { message: 'Data not found!' })
        return msg(res, 200, { message: "Fetch all data successfully!", data: faof })
    } catch (err) {
        console.log('FetchAllOverallFinding : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Insert
exports.InsertOverallFinding = async (req, res) => {
    try {
        const ofd = req.body

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(ofd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value && key == 'overall_finding_name') hasEmptyValue = true
                // if (value && key == 'content_of_medical_record_name') {
                //     const cu = await ofm.CheckUnique(key, value) // cu = CheckUnique
                //     if (cu) {
                //         duplicateStatus.push(409)
                //         duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                //     }
                // }

                if (value && key == 'patient_service_id') {
                    const cptsi = await ofm.CheckPatientServiceId(key, value) // cptsi = check patient service id
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

        ofd.created_by = req.fullname
        ofd.updated_by = req.fullname

        const startTime = Date.now()
        const iof = await ofm.InsertOverallFinding(ofd)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, iof)
        await ofm.InsertLog(sl)

        return msg(res, 200, { message: 'Created successfully!' })
    } catch (err) {
        console.log('InsertOverallFinding : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function FetchOne
exports.FetchOneOverallFindingById = async (req, res) => {
    try {
        const ofId = req.params.ofId

        const startTime = Date.now()
        const foof = await ofm.FetchOneOverallFindingById(ofId) // foof = fetch one overall finding by id
        if (!foof) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, foof)
        await ofm.InsertLog(sl)

        return msg(res, 200, { data: foof })
    } catch (err) {
        console.log('FetchOneOverallFindingById : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Update
exports.UpdateOverallFinding = async (req, res) => {
    try {
        const ofId = req.params.ofId
        const foof = await ofm.FetchOneOverallFindingById(ofId) // foof = fetch one overall finding by id
        if (!foof) return msg(res, 404, { message: 'Data not found!' })

        const ofd = req.body

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(ofd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value && key == 'overall_finding_name') hasEmptyValue = true
                // if (value && key == 'content_of_medical_record_name') {
                //     const cu = await ofm.CheckUnique(key, value) // cu = CheckUnique
                //     if (cu) {
                //         duplicateStatus.push(409)
                //         duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                //     }
                // }

                if (value && key == 'patient_service_id') {
                    const cptsi = await ofm.CheckPatientServiceId(key, value) // cptsi = check patient service id
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

        ofd.created_by = req.fullname
        ofd.updated_by = req.fullname

        const startTime = Date.now()
        const uof = await ofm.UpdateOverallFinding(ofId, ofd)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, uof)
        await ofm.InsertLog(sl)

        return msg(res, 200, { message: 'Updated successfully!' })
    } catch (err) {
        console.log('UpdateOverallFinding : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Delete
exports.RemoveOverallFinding = async (req, res) => {
    try {
        const ofId = req.params.ofId
        const foof = await ofm.FetchOneOverallFindingById(ofId) // foof = fetch one overall finding by id
        if (!foof) return msg(res, 404, { message: 'Data not found!' })

        const startTime = Date.now()
        const rof = await ofm.RemoveOverallFinding(ofId)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, rof)
        await ofm.InsertLog(sl)

        return msg(res, 200, { message: 'Removed successfully!' })
    } catch (err) {
        console.log('RemoveOverallFinding : ', err)
        return msg(res, 500, { message: err.message })
    }
}