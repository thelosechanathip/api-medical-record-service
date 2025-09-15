const { msg } = require('../../../services/message.service')
const { setLog } = require('../../../services/setLog.service')
const ptsm = require('./patient-service.model') // ptsm = patient service model

// Function FetchAll
exports.FetchAllPatientServices = async (req, res) => {
    try {
        const startTime = Date.now()
        const fapts = await ptsm.FetchAllPatientServices() // fapts = fetch all patient services
        if (fapts.length === 0) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, fapts) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: "Fetch all data successfully!", data: fapts })
    } catch (err) {
        console.log('FetchAllPatientServices : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Insert
exports.CreatePatientService = async (req, res) => {
    try {
        const ptsd = req.body // ptsd = patient service data

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(ptsd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value) hasEmptyValue = true

                // ตรวจสอบค่าซ้ำเฉพาะ field ที่ไม่ว่าง
                if (value) {
                    const ffpts = await ptsm.FindFirstPatientService(key, value) // ffpts = find first patient service
                    if (ffpts) {
                        duplicateStatus.push(409)
                        duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
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

        ptsd.created_by = req.fullname
        ptsd.updated_by = req.fullname

        const startTime = Date.now()
        const cps = await ptsm.CreatePatientService(ptsd)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, cps) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: 'Created successfully!' })
    } catch (err) {
        console.log('CreatePatientService : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function FetchOne
exports.FetchOnePatientServiceById = async (req, res) => {
    try {
        const ptsId = req.params.ptsId // ptsId = patient service id

        const startTime = Date.now()
        const fopsbi = await ptsm.FetchOnePatientServiceById(ptsId) // fopsbi = fetch one patient service by id
        if (!fopsbi) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, fopsbi) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { data: fopsbi })
    } catch (err) {
        console.log('FetchOnePatientServiceById : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Update
exports.UpdatePatientService = async (req, res) => {
    try {
        const ptsId = req.params.ptsId // ptsId = patient service id

        const foptsbi = await ptsm.FetchOnePatientServiceById(ptsId) // foptsbi = fetch one patient service by id
        if (!foptsbi) return msg(res, 404, { message: 'Data not found!' })

        const ptsd = req.body // ptsd = patient service data

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const duplicateStatus = []
        const duplicateMessage = []
        let hasEmptyValue = false // Flag สำหรับตรวจสอบค่าที่ว่าง

        await Promise.all(
            Object.entries(ptsd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value) hasEmptyValue = true

                // ตรวจสอบค่าซ้ำเฉพาะ field ที่ไม่ว่าง
                if (value) {
                    const ffpts = await ptsm.FindFirstPatientService(key, value) // ffpts = find first patient service
                    if (ffpts) {
                        duplicateStatus.push(409)
                        duplicateMessage.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
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

        ptsd.updated_by = req.fullname

        const startTime = Date.now()
        const ups = await ptsm.UpdatePatientService(ptsId, ptsd)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, ups) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: 'Updated successfully!' })
    } catch (err) {
        console.log('UpdatePatientService : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Delete
exports.RemovePatientService = async (req, res) => {
    try {
        const ptsId = req.params.ptsId // ptsId = patient service id

        const foptsbi = await ptsm.FetchOnePatientServiceById(ptsId) // foptsbi = fetch one patient service by id
        if (!foptsbi) return msg(res, 404, { message: 'Data not found!' })

        const startTime = Date.now()
        const rtps = await ptsm.RemovePatientService(ptsId) // rtps = remove patient service
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, rtps) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: 'Removed successfully!' })
    } catch (err) {
        console.log('RemovePatientService : ', err)
        return msg(res, 500, { message: err.message })
    }
}