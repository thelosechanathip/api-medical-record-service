const { msg } = require('../../../services/message.service')
const { setLog } = require('../../../services/setLog.service')
const cdM = require('./clinical-detail.model')

// Function FetchAll
exports.FetchAllClinicalDetails = async (req, res) => {
    try {
        const startTime = Date.now()
        const FaCd = await cdM.FetchAllClinicalDetails()
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, FaCd)
        await cdM.InsertLog(sl)

        if (FaCd.length === 0) return msg(res, 404, { message: 'Data not found!' })
        return msg(res, 200, { message: "Fetch all data successfully!", data: FaCd })
    } catch (err) {
        console.log('FetchAllClinicalDetails : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Insert
exports.InsertClinicalDetail = async (req, res) => {
    try {
        const cdD = req.body

        if (!cdD.clinical_detail_name) return msg(res, 400, { message: 'กรุณากรอกชื่อข้อมูลทางคลินิก!' })
        if (!cdD.patient_service_id) return msg(res, 400, { message: 'กรุณากรอกกลุ่มคนไข้!' })

        const cpsi = await cdM.CheckPatientServiceId({ patient_service_id: cdD.patient_service_id })
        if (!cpsi) return msg(res, 404, { message: 'ไม่มีข้อมูลคำระบุของกลุ่มคนไข้ที่เลือกมากรุณาตรวจสอบ!' })

        const cu = await cdM.CheckUnique({
            clinical_detail_name: cdD.clinical_detail_name,
            patient_service_id: cdD.patient_service_id
        })
        if (cu) return msg(res, 409, {
            message: `มีข้อมูล ${cdD.clinical_detail_name} ในกลุ่มคนไข้ ${cpsi.patient_service_name_english} อยู่แล้วไม่อนุญาตให้บันทึกข้อมูลซ้ำในกลุ่มคนไข้เดียวกัน!`
        })

        const cPriority = await cdM.CheckPriority({ patient_service_id: cdD.patient_service_id })
        if (cPriority) cdD.priority = cPriority.priority + 1
        else cdD.priority = 1

        cdD.created_by = req.fullname
        cdD.updated_by = req.fullname

        const startTime = Date.now()
        const iCd = await cdM.InsertClinicalDetail(cdD)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, iCd)
        await cdM.InsertLog(sl)

        return msg(res, 200, { message: 'Created successfully!' })

    } catch (err) {
        console.log('InsertClinicalDetail : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function FetchOne
exports.FetchOneClinicalDetailById = async (req, res) => {
    try {
        const cdId = req.params.cdId

        const startTime = Date.now()
        const foCdBi = await cdM.FetchOneClinicalDetailById(cdId)
        if (!foCdBi) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, foCdBi)
        await cdM.InsertLog(sl)

        return msg(res, 200, { data: foCdBi })
    } catch (err) {
        console.log('FetchOneClinicalDetailById : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Fucntion Update
exports.UpdateClinicalDetail = async (req, res) => {
    try {
        const cdId = req.params.cdId
        const foCdBi = await cdM.FetchOneClinicalDetailById(cdId)
        if (!foCdBi) return msg(res, 404, { message: 'Data not found!' })

        const cdD = req.body

        if (!cdD.clinical_detail_name) return msg(res, 400, { message: 'กรุณากรอกชื่อข้อมูลทางคลินิก!' })

        let cpError = false
        for (const [k, v] of Object.entries(cdD)) if (k == 'patient_service_id') cpError = true
        if (cpError == true) return msg(res, 400, { message: 'ไม่อนุญาติให้แก้ไขกลุ่มคนไข้ เพื่อป้องกันข้อมูลทับซ้อน!' })

        const foCdNbCdi = await cdM.FetchOneClinicalDetailNotByClinicalDetailId(cdId, cdD.clinical_detail_name, foCdBi.patient_service_id)
        if (foCdNbCdi.length >= 1) return msg(res, 409, { message: 'ไม่อนุญาตให้บันทึกข้อมูลซ้ำในชื่อการค้นพบนี้!' })

        cdD.updated_by = req.fullname

        const startTime = Date.now()
        const uCd = await cdM.UpdateClinicalDetail(cdId, cdD)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, uCd)
        await cdM.InsertLog(sl)

        return msg(res, 200, { message: 'Updated successfully!' })
    } catch (err) {
        console.log('UpdateClinicalDetail : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Delete
exports.RemoveClinicalDetail = async (req, res) => {
    try {
        const cdId = req.params.cdId
        const foCdBi = await cdM.FetchOneClinicalDetailById(cdId)
        if (!foCdBi) return msg(res, 404, { message: 'Data not found!' })

        const CFk = await cdM.CheckForeignKey()

        if (CFk.length > 0) {
            let hasReference = false

            for (const row of CFk) {
                const tableName = row.TABLE_NAME
                const columnName = row.COLUMN_NAME

                const checkData = await cdM.CheckForeignKeyData(tableName, columnName, cdId)

                if (checkData.length > 0) hasReference = true
            }

            // ถ้ามีตารางที่อ้างอิงอยู่ → ห้ามลบ
            if (hasReference) return msg(res, 400, { message: "ไม่สามารถลบได้ เนื่องจากข้อมูลนี้ยังถูกใช้งานอยู่ กรุณาลบหรือแก้ไขข้อมูลที่เกี่ยวข้องก่อน!" })
        }

        const startTime = Date.now()
        const rCd = await cdM.RemoveClinicalDetail(cdId)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, rCd)
        await cdM.InsertLog(sl)

        return msg(res, 200, { message: 'Removed successfully!' })
    } catch (err) {
        console.log('RemoveClinicalDetail : ', err)
        return msg(res, 500, { message: err.message })
    }
}