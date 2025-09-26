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
        const sl = setLog(req, req.fullname, endTime, fars)
        await rstm.InsertLog(sl)

        return msg(res, 200, { message: "Fetch all data successfully!", data: fars })
    } catch (err) {
        console.log('FetchAllReviewStatus : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Insert
exports.InsertReviewStatus = async (req, res) => {
    try {
        const rstd = req.body

        if (!rstd.review_status_name) return msg(res, 400, { message: 'กรุณากรอกสถานะการตรวจสอบ!' })
        if (!rstd.patient_service_id) return msg(res, 400, { message: 'กรุณากรอกกลุ่มคนไข้!' })

        const cpsi = await rstm.CheckPatientServiceId({ patient_service_id: rstd.patient_service_id })
        if (!cpsi) return msg(res, 404, { message: 'ไม่มีข้อมูลคำระบุของกลุ่มคนไข้ที่เลือกมากรุณาตรวจสอบ!' })

        const cu = await rstm.CheckUnique({
            review_status_name: rstd.review_status_name,
            patient_service_id: rstd.patient_service_id
        })
        if (cu) return msg(res, 409, {
            message: `มีข้อมูล ${rstd.review_status_name} ในกลุ่มคนไข้ ${cpsi.patient_service_name_english} อยู่แล้วไม่อนุญาตให้บันทึกข้อมูลซ้ำในกลุ่มคนไข้เดียวกัน!`
        })

        const cPriority = await rstm.CheckPriority({ patient_service_id: rstd.patient_service_id })
        if (cPriority) rstd.priority = cPriority.priority + 1
        else rstd.priority = 1

        rstd.created_by = req.fullname
        rstd.updated_by = req.fullname

        const startTime = Date.now()
        const irst = await rstm.InsertReviewStatus(rstd) // irst = insert review status
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, irst)
        await rstm.InsertLog(sl)

        return msg(res, 200, { message: 'Created successfully!' })
    } catch (err) {
        console.log('InsertReviewStatus : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function FetchOne
exports.FetchOneReviewStatusById = async (req, res) => {
    try {
        const rstId = req.params.rstId // rstId = review status id

        const startTime = Date.now()
        const forstbi = await rstm.FetchOneReviewStatusById({ review_status_id: rstId }) // forstbi = fetch one review status by id
        if (!forstbi) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, forstbi)
        await rstm.InsertLog(sl)

        return msg(res, 200, { data: forstbi })
    } catch (err) {
        console.log('FetchOneReviewStatusById : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Update
exports.UpdateReviewStatus = async (req, res) => {
    try {
        const rstId = req.params.rstId // rstId = review status id
        const forstbi = await rstm.FetchOneReviewStatusById({ review_status_id: rstId }) // forstbi = fetch one review status by id
        if (!forstbi) return msg(res, 404, { message: 'Data not found!' })

        const rstd = req.body

        if (!rstd.review_status_name) return msg(res, 400, { message: 'กรุณากรอกสถานะการตรวจสอบ!' })

        let cpError = false
        for (const [k, v] of Object.entries(rstd)) if (k == 'patient_service_id') cpError = true
        if (cpError == true) return msg(res, 400, { message: 'ไม่อนุญาติให้แก้ไขกลุ่มคนไข้ เพื่อป้องกันข้อมูลทับซ้อน!' })

        const FoRstNbRsi = await rstm.FetchOneReviewStatusNotByReviewStatusId(
            rstId,
            rstd.review_status_name,
            forstbi.patient_service_id
        )
        if (FoRstNbRsi >= 1) return msg(res, 409, { message: "ไม่อนุญาตให้บันทึกข้อมูลซ้ำในสถานะการตรวจสอบนี้!" })

        rstd.updated_by = req.fullname

        const startTime = Date.now()
        const urst = await rstm.UpdateReviewStatus({ review_status_id: rstId }, rstd) // urst = update review status
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, urst)
        await rstm.InsertLog(sl)

        return msg(res, 200, { message: 'Updated successfully!' })
    } catch (err) {
        console.log('UpdateReviewStatus : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Delete
exports.RemoveReviewStatus = async (req, res) => {
    try {
        const rstId = req.params.rstId // rstId = review status id
        const forstbi = await rstm.FetchOneReviewStatusById({ review_status_id: rstId }) // forstbi = fetch one review status by id
        if (!forstbi) return msg(res, 404, { message: 'Data not found!' })

        const CFk = await comrm.CheckForeignKey()

        if (CFk.length > 0) {
            let hasReference = false

            for (const row of CFk) {
                const tableName = row.TABLE_NAME
                const columnName = row.COLUMN_NAME

                const checkData = await comrm.CheckForeignKeyData(tableName, columnName, rstId)

                if (checkData.length > 0) hasReference = true
            }

            // ถ้ามีตารางที่อ้างอิงอยู่ → ห้ามลบ
            if (hasReference) return msg(res, 400, { message: "ไม่สามารถลบได้ เนื่องจากข้อมูลนี้ยังถูกใช้งานอยู่ กรุณาลบหรือแก้ไขข้อมูลที่เกี่ยวข้องก่อน!" })
        }

        const startTime = Date.now()
        const rrst = await rstm.RemoveReviewStatus({ review_status_id: rstId }) // rrst = remove review status
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, rrst)
        await rstm.InsertLog(sl)

        return msg(res, 200, { message: 'Removed successfully!' })
    } catch (err) {
        console.log('RemoveReviewStatus : ', err)
        return msg(res, 500, { message: err.message })
    }
}