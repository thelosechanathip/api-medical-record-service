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

        if (!ofd.overall_finding_name) return msg(res, 400, { message: 'กรุณากรอกชื่อการค้นพบ!' })
        if (!ofd.patient_service_id) return msg(res, 400, { message: 'กรุณากรอกกลุ่มคนไข้!' })

        const cpsi = await ofm.CheckPatientServiceId({ patient_service_id: ofd.patient_service_id })
        if (!cpsi) return msg(res, 404, { message: 'ไม่มีข้อมูลคำระบุของกลุ่มคนไข้ที่เลือกมากรุณาตรวจสอบ!' })

        const cu = await ofm.CheckUnique({
            overall_finding_name: ofd.overall_finding_name,
            patient_service_id: ofd.patient_service_id
        })
        if (cu) return msg(res, 409, {
            message: `มีข้อมูล ${ofd.overall_finding_name} ในกลุ่มคนไข้ ${cpsi.patient_service_name_english} อยู่แล้วไม่อนุญาตให้บันทึกข้อมูลซ้ำในกลุ่มคนไข้เดียวกัน!`
        })

        const cPriority = await ofm.CheckPriority({ patient_service_id: ofd.patient_service_id })
        if (cPriority) ofd.priority = cPriority.priority + 1
        else ofd.priority = 1

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
        const foof = await ofm.FetchOneOverallFindingById({ overall_finding_id: ofId }) // foof = fetch one overall finding by id
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
        const foof = await ofm.FetchOneOverallFindingById({ overall_finding_id: ofId }) // foof = fetch one overall finding by id
        if (!foof) return msg(res, 404, { message: 'Data not found!' })

        const ofd = req.body

        if (!ofd.overall_finding_name) return msg(res, 400, { message: 'กรุณากรอกชื่อการค้นพบ!' })

        let cpError = false
        for (const [k, v] of Object.entries(ofd)) if (k == 'patient_service_id') cpError = true
        if (cpError == true) return msg(res, 400, { message: 'ไม่อนุญาติให้แก้ไขกลุ่มคนไข้ เพื่อป้องกันข้อมูลทับซ้อน!' })

        const FoOfNbOfi = await ofm.FetchOneOverallFindingNotByOverallFindingId(ofId, ofd.overall_finding_name, foof.patient_service_id)
        if (FoOfNbOfi.length >= 1) return msg(res, 409, { message: 'ไม่อนุญาตให้บันทึกข้อมูลซ้ำในชื่อการค้นพบนี้!' })

        ofd.updated_by = req.fullname

        const startTime = Date.now()
        const uof = await ofm.UpdateOverallFinding({ overall_finding_id: ofId }, ofd)
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
        const foof = await ofm.FetchOneOverallFindingById({ overall_finding_id: ofId }) // foof = fetch one overall finding by id
        if (!foof) return msg(res, 404, { message: 'Data not found!' })

        const CFk = await comrm.CheckForeignKey()

        if (CFk.length > 0) {
            let hasReference = false

            for (const row of CFk) {
                const tableName = row.TABLE_NAME
                const columnName = row.COLUMN_NAME

                const checkData = await comrm.CheckForeignKeyData(tableName, columnName, ofId)

                if (checkData.length > 0) hasReference = true
            }

            // ถ้ามีตารางที่อ้างอิงอยู่ → ห้ามลบ
            if (hasReference) return msg(res, 400, { message: "ไม่สามารถลบได้ เนื่องจากข้อมูลนี้ยังถูกใช้งานอยู่ กรุณาลบหรือแก้ไขข้อมูลที่เกี่ยวข้องก่อน!" })
        }

        const startTime = Date.now()
        const rof = await ofm.RemoveOverallFinding({ overall_finding_id: ofId })
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