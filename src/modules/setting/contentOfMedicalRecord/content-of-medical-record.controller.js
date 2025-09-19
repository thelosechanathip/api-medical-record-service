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

        if (!comrd.content_of_medical_record_name) return msg(res, 400, { message: 'กรุณากรอกชื่อประเภทข้อมูล!' })
        if (!comrd.patient_service_id) return msg(res, 400, { message: 'กรุณากรอกกลุ่มคนไข้!' })

        const cpsi = await comrm.CheckPatientServiceId({ patient_service_id: comrd.patient_service_id })
        if (!cpsi) return msg(res, 404, { message: 'ไม่มีข้อมูลคำระบุของกลุ่มคนไข้ที่เลือกมากรุณาตรวจสอบ!' })

        const cu = await comrm.CheckUnique({
            content_of_medical_record_name: comrd.content_of_medical_record_name,
            patient_service_id: comrd.patient_service_id
        })
        if (cu) return msg(res, 409, {
            message: `มีข้อมูล ${comrd.content_of_medical_record_name} ในกลุ่มคนไข้ ${cpsi.patient_service_name_english} อยู่แล้วไม่อนุญาตให้บันทึกข้อมูลซ้ำในกลุ่มคนไข้เดียวกัน!`
        })

        const cPriority = await comrm.CheckPriority({ patient_service_id: comrd.patient_service_id })
        if (cPriority) comrd.priority = cPriority.priority + 1
        else comrd.priority = 1

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
        const focomr = await comrm.FetchOneContentOfMedicalRecordById({ content_of_medical_record_id: comrId }) // focomr = fetch one content of medical record by id
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
        const focomr = await comrm.FetchOneContentOfMedicalRecordById({ content_of_medical_record_id: comrId }) // focomr = fetch one content of medical record by id
        if (!focomr) return msg(res, 404, { message: 'Data not found!' })

        const comrd = req.body

        // if (!comrd.content_of_medical_record_name) return msg(res, 400, { message: 'กรุณากรอกชื่อประเภทข้อมูล' })
        // if (!comrd.patient_service_id) return msg(res, 400, { message: 'กรุณากรอกกลุ่มคนไข้' })

        // const cpsi = await comrm.CheckPatientServiceId({ patient_service_id: comrd.patient_service_id })
        // if (!cpsi) return msg(res, 404, { message: 'ไม่มีข้อมูลคำระบุของกลุ่มคนไข้ที่เลือกมากรุณาตรวจสอบ!' })

        // const cu = await comrm.CheckUnique({
        //     content_of_medical_record_name: comrd.content_of_medical_record_name,
        //     patient_service_id: comrd.patient_service_id
        // })
        // if (cu) return msg(res, 409, {
        //     message: `มีข้อมูล ${comrd.content_of_medical_record_name} ในกลุ่มคนไข้ ${cpsi.patient_service_name_english} อยู่แล้วไม่อนุญาตให้บันทึกข้อมูลซ้ำในกลุ่มคนไข้เดียวกัน!`
        // })

        // const cPriority = await comrm.CheckPriority({ patient_service_id: comrd.patient_service_id })
        // if (cPriority) comrd.priority = cPriority.priority + 1
        // else comrd.priority = 1

        comrd.updated_by = req.fullname

        const startTime = Date.now()
        const ucomr = await comrm.UpdateContentOfMedicalRecord({ content_of_medical_record_id: comrId }, comrd) // ucomr = update content of medical record
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
        const focomr = await comrm.FetchOneContentOfMedicalRecordById({ content_of_medical_record_id: comrId }) // focomr = fetch one content of medical record by id
        if (!focomr) return msg(res, 404, { message: 'Data not found!' })

        const CFk = await comrm.CheckForeignKey()

        if (CFk.length > 0) {
            let hasReference = false

            for (const row of CFk) {
                const tableName = row.TABLE_NAME
                const columnName = row.COLUMN_NAME

                const checkData = await comrm.CheckForeignKeyData(tableName, columnName, comrId)

                if (checkData.length > 0) hasReference = true
            }

            // ถ้ามีตารางที่อ้างอิงอยู่ → ห้ามลบ
            if (hasReference) return msg(res, 400, { message: "ไม่สามารถลบได้ เนื่องจากข้อมูลนี้ยังถูกใช้งานอยู่ กรุณาลบหรือแก้ไขข้อมูลที่เกี่ยวข้องก่อน!" })
        }

        const startTime = Date.now()
        const rcomr = await comrm.RemoveContentOfMedicalRecord({ content_of_medical_record_id: comrId }) // rcomr = remove content of medical record
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