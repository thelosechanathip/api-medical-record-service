const { msg } = require('../../../services/message.service')
const { setLog } = require('../../../services/setLog.service')
const ptsm = require('./patient-service.model') // ptsm = patient service model

// Function FetchAll
exports.FetchAllPatientServices = async (req, res) => {
    try {
        const st = Date.now() // st = start time
        const fapts = await ptsm.FetchAllPatientServices() // fapts = fetch all patient services
        if (fapts.length === 0) return msg(res, 404, { message: 'Data not found!' })
        const et = Date.now() - st // et = end time

        // Set and Insert Log
        const sl = setLog(req, req.fullname, et, fapts) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: "Fetch all data successfully!", data: fapts })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Function Insert
exports.CreatePatientService = async (req, res) => {
    try {
        const ptsd = req.body // ptsd = patient service data

        // ตรวจสอบค่าซ้ำ โดยเก็บค่า duplicate message ไว้ก่อน
        const dpcs = [] // dpcs = deplicate status
        const dpcms = [] // dpcms = duplicate messages
        let hev = false // Flag สำหรับตรวจสอบค่าที่ว่าง, hev = has empty value

        await Promise.all(
            Object.entries(ptsd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value) hev = true

                // ตรวจสอบค่าซ้ำเฉพาะ field ที่ไม่ว่าง
                if (value) {
                    const ffpts = await ptsm.FindFirstPatientService(key, value) // ffpts = find first patient service
                    if (ffpts) {
                        dpcs.push(409)
                        dpcms.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                    }
                }
            })
        )

        // ถ้ามีค่าที่ว่าง ให้เพิ่มข้อความแค่ครั้งเดียว
        if (hev) {
            dpcms.unshift("กรุณากรอกข้อมูลให้ครบถ้วน!")
            return msg(res, 400, { message: dpcms[0] })
        }

        // ถ้ามีข้อมูลซ้ำหรือค่าที่ว่าง ให้ส่ง response กลับครั้งเดียว
        if (dpcms.length > 0) return msg(res, Math.max(...dpcs), { message: dpcms.join(" AND ") })

        ptsd.created_by = req.fullname
        ptsd.updated_by = req.fullname

        const st = Date.now() // st = start time
        const rd = await ptsm.CreatePatientService(ptsd)
        const et = Date.now() - st // et = end time

        // Set and Insert Log
        const sl = setLog(req, req.fullname, et, rd) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: 'Created successfully!' })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Function FetchOne
exports.FetchOnePatientServiceById = async (req, res) => {
    try {
        const ptsId = req.params.ptsId // ptsId = patient service id

        const st = Date.now() // st = start time
        const fopsbi = await ptsm.FetchOnePatientServiceById(ptsId) // fopsbi = fetch one patient service by id
        if (!fopsbi) return msg(res, 404, { message: 'Data not found!' })
        const et = Date.now() - st // et = end time

        // Set and Insert Log
        const sl = setLog(req, req.fullname, et, fopsbi) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { data: fopsbi })
    } catch (err) {
        throw new Error(err.message)
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
        const dpcs = [] // dpcs = deplicate status
        const dpcms = [] // dpcms = duplicate messages
        let hev = false // Flag สำหรับตรวจสอบค่าที่ว่าง, hev = has empty value

        await Promise.all(
            Object.entries(ptsd).map(async ([key, value]) => {
                // ถ้าพบค่าว่าง ให้ตั้งค่า flag เป็น true
                if (!value) hev = true

                // ตรวจสอบค่าซ้ำเฉพาะ field ที่ไม่ว่าง
                if (value) {
                    const ffpts = await ptsm.FindFirstPatientService(key, value) // ffpts = find first patient service
                    if (ffpts) {
                        dpcs.push(409)
                        dpcms.push(`( ${value} ) มีข้อมูลในระบบแล้ว ไม่อนุญาตให้บันทึกข้อมูลซ้ำ!`)
                    }
                }
            })
        )

        // ถ้ามีค่าที่ว่าง ให้เพิ่มข้อความแค่ครั้งเดียว
        if (hev) {
            dpcms.unshift("กรุณากรอกข้อมูลให้ครบถ้วน!")
            return msg(res, 400, { message: dpcms[0] })
        }

        // ถ้ามีข้อมูลซ้ำหรือค่าที่ว่าง ให้ส่ง response กลับครั้งเดียว
        if (dpcms.length > 0) return msg(res, Math.max(...dpcs), { message: dpcms.join(" AND ") })

        ptsd.updated_by = req.fullname

        const st = Date.now() // st = start time
        const ups = await ptsm.UpdatePatientService(ptsId, ptsd)
        const et = Date.now() - st // et = end time

        // Set and Insert Log
        const sl = setLog(req, req.fullname, et, ups) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: 'Updated successfully!' })
    } catch (err) {
        throw new Error(err.message)
    }
}

// Function Delete
exports.RemovePatientService = async (req, res) => {
    try {
        const ptsId = req.params.ptsId // ptsId = patient service id

        const foptsbi = await ptsm.FetchOnePatientServiceById(ptsId) // foptsbi = fetch one patient service by id
        if (!foptsbi) return msg(res, 404, { message: 'Data not found!' })

        const st = Date.now() // st = start time
        const rtps = await ptsm.RemovePatientService(ptsId) // rtps = remove patient service
        const et = Date.now() - st // et = end time

        // Set and Insert Log
        const sl = setLog(req, req.fullname, et, rtps) // sl = set log
        await ptsm.InsertLog(sl)

        return msg(res, 200, { message: 'Removed successfully!' })
    } catch (err) {
        throw new Error(err.message)
    }
}