const { msg } = require('../../services/message.service')
const { setLog } = require('../../services/setLog.service')
const { ComparePassword } = require('../../services/bcrypt')
const mraM = require('./mra.model') // mraM = mra model

// สร้าง Form
exports.GenerateForm = async (req, res) => {
    const mraD = req.body // รับค่าจาก User
    const ps = await mraM.FetchOnePatientService() // ดึงค่า patient_service_id อ้างอิงจากกลุ่ม IPD

    try {
        const fh = await mraM.FetchHcode() // ดึงข้อมูลสถานพยาบาล
        // เตรียมข้อมูลของผู้ใช้งาน
        const fullnamePayload = {
            created_by: req.fullname,
            updated_by: req.fullname
        }

        // ตรวจสอบว่ามีการกรอก AN เข้ามาหรือไม่?
        if (!mraD.patient_an) return msg(res, 400, { message: 'กรุณากรอก AN ที่ต้องการบันทึก!' })

        const fPIM = await mraM.FetchPatientInMra({ patient_an: mraD.patient_an }) // ดึงข้อมูลผู้ใช้งานจากตาราง patients
        if (fPIM) {
            const formData = await mraM.FetchOneFormIpdIdByPatientId(fPIM.patient_id) // ดึงข้อมูล Form IPD อ้างอิงจาก patient_id
            const formIRSR = await mraM.FetchFormIRSRInMra(formData.patient_id) // ดึงข้อมูล form_ipd_review_status_result อ้างอิงจาก patient_id
            if (formIRSR) {
                return msg(res, 409, { message: `ได้มีข้อมูลของ ${mraD.patient_an} อยู่ในระบบแล้ว ไม่อนุญาติให้บันทึกข้อมูลซ้ำ!` })
            } else if (formIRSR === null || formIRSR === '') {
                const result = await mraM.FetchOneData(fPIM.patient_id) // ดึงข้อมูล Form IPD อ้างอิงจาก patient_id
                return msg(res, 200, { data: result })
            }
        }

        // ดึงข้อมูลคนไข้จากระบบ HOSxP
        const fpih = await mraM.FetchPatientInHos(mraD.patient_an)

        // Set ข้อมูลคนไข้ก่อนที่จะบันทึกไปยัง MRA ตาราง patients
        const pPayload = {
            hcode_id: fh.hcode_id,
            patient_fullname: fpih.fullname,
            patient_hn: fpih.hn,
            patient_vn: fpih.vn,
            patient_an: fpih.an,
            patient_ward: fpih.ward_name,
            patient_date_service: fpih.vstdate,
            patient_date_admitted: fpih.regdate,
            patient_date_discharged: fpih.dchdate,
            ...fullnamePayload
        }

        const startTime = Date.now()
        const ip = await mraM.InsertPatient(pPayload) // บันทึกข้อมูลคนไข้ไปยัง MRA ตาราง patients
        if (ip) {
            // Set ข้อมูลคนไข้ก่อนที่จะทำการสร้าง Form สำหรับบันทึกข้อมูล
            const fiPayload = {
                patient_id: ip.patient_id,
                ...fullnamePayload
            }

            const ifi = await mraM.InsertFormIpd(fiPayload) // สร้าง Form IPD สำหรับบันทึกข้อมูล Chart ของคนไข้
            if (ifi) {
                const fComri = await mraM.FetchContentOfMedicalRecordById(ps.patient_service_id) // ดึงข้อมูลจากตาราง content_of_medical_records ที่อยู่ในกลุ่ม IPD
                // Set ข้อมูลก่อนที่จะทำการสร้าง Form ContentOfmedicalRecordResult
                const setComrPayload = fComri.map((item) => {
                    return {
                        form_ipd_id: ifi.form_ipd_id,
                        ...item,
                        ...fullnamePayload
                    }
                })
                const iFiComdrr = await mraM.InsertFormIpdContentOfMedicalRecordResult(setComrPayload) // สร้าง Form ContentOfMedicalRecordResult
                if (iFiComdrr) {
                    const fOf = await mraM.FetchOverallFindingByPatientId(ps.patient_service_id) // ดึงข้อมูลจากตาราง overall_finding ที่อยู่ในกลุ่ม IPD
                    const setOfPayload = fOf.map((item) => {
                        return {
                            form_ipd_id: ifi.form_ipd_id,
                            ...item,
                            ...fullnamePayload
                        }
                    })
                    await mraM.InsertFormIpdOverallFindingResult(setOfPayload) // สร้าง Form OverallFindingResult
                }
            }
        }

        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, ip) // sl = set log
        await mraM.InsertLog(sl)

        const result = await mraM.FetchOneData(ip.patient_id) // ดึงข้อมูล Form IPD อ้างอิงจาก patient_id
        return msg(res, 200, { data: result })
    } catch (err) {
        console.log('GenerateForm : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Update data to Form
exports.UpdateForm = async (req, res) => {
    try {
        const data = req.body
        const fullnamePayload = {
            updated_by: req.fullname
        }

        const startTime = Date.now()
        const faip = await mraM.FetchAnInPatient({ patient_an: req.params.patient_an })
        if (!faip) return msg(res, 404, { message: `ไม่พอข้อมูล ${an} นี่ในระบบ MRA IPD` })

        const fOFIIBPI = await mraM.FetchOneFormIpdIdByPatientId(faip.patient_id) // ดึงข้อมูลจากตาราง form_ipds อ้างอิงจาก patient_id
        if (fOFIIBPI) {
            const { content } = data
            let ContentErrorResult = []
            for (i of content) {
                const result = await mraM.FetchOneFormIpdContentOfMedicalRecordResult({
                    form_ipd_content_of_medical_record_result_id: i.form_ipd_content_of_medical_record_result_id,
                    content_of_medical_record_id: i.content_of_medical_record_id
                })
                if (!result) ContentErrorResult.push(
                    `ไม่พอข้อมูล ${i.form_ipd_content_of_medical_record_result_id} หรือ ${i.content_of_medical_record_id} นี่ในระบบ MRA IPD`
                )
            }

            if (ContentErrorResult.length > 0) return msg(res, 404, { message: ContentErrorResult.join(" AND ") })

            // คีย์ที่ไม่ต้องการให้รวมในการคำนวณ (ยกเว้น point_deducted ที่จะลบทีหลัง)
            const excludedKeys = [
                "form_ipd_content_of_medical_record_result_id",
                "form_ipd_id",
                "content_of_medical_record_id",
                "na",
                "missing",
                "no",
                "comment",
                "total_score", // ถ้ามีอยู่ในข้อมูลเดิม จะไม่รวม
                "point_deducted" // จะแยกไปลบทีหลัง
            ]

            const rFICOMR = content.map(item => {
                const keys = Object.keys(item).filter(k => !excludedKeys.includes(k))

                let totalScore

                // 1) ถ้าต้องการเซตทุกค่านอก excludedKeys เป็น 0 เมื่อ na/missing/no เป็น true
                if (item.na || item.missing || item.no) {
                    keys.forEach(k => item[k] = 0)
                    item.point_deducted = 0
                    totalScore = 0
                } else {
                    const itemSum = keys.reduce((acc, k) => acc + (Number(item[k]) || 0), 0)
                    // ลบ point_deducted
                    totalScore = itemSum - (Number(item.point_deducted) || 0)
                }

                return {
                    ...item,
                    total_score: totalScore,
                    ...fullnamePayload
                }
            })

            const updatePromissFICOMR = rFICOMR.map(i =>
                mraM.UpdateFormIpdContentOfMedicalRecordResult(i, fOFIIBPI.form_ipd_id)
            )
            await Promise.all(updatePromissFICOMR)

            if (updatePromissFICOMR) {
                const { overall } = data
                let OverallErrorResult = []
                for (i of overall) {
                    const result = await mraM.FetchOneFormIpdOverallFindingResult({
                        form_ipd_overall_finding_result_id: i.form_ipd_overall_finding_result_id,
                        overall_finding_id: i.overall_finding_id
                    })
                    if (!result) OverallErrorResult.push(
                        `ไม่พอข้อมูล ${i.form_ipd_overall_finding_result_id} หรือ ${i.overall_finding_id} นี่ในระบบ MRA IPD`
                    )
                }

                if (OverallErrorResult.length > 0) return msg(res, 404, { message: OverallErrorResult.join(" AND ") })

                const rFIOF = overall.map(item => {
                    return {
                        ...item,
                        ...fullnamePayload
                    }
                })

                const updatePromissesFIOF = rFIOF.map(i =>
                    mraM.UpdateFormIpdOverallFindingResult(i, fOFIIBPI.form_ipd_id)
                )
                await Promise.all(updatePromissesFIOF)

                if (updatePromissesFIOF) {
                    const { content, overall, ...rsD } = data
                    if (Object.keys(rsD).length > 0) {
                        fullnamePayload.created_by = req.fullname

                        const foRstORs = await mraM.FetchOneRSTOnReviewStatus({ review_status_id: rsD.review_status_id })
                        if (foRstORs.review_status_type === true) {
                            if (rsD.review_status_comment === null || rsD.review_status_comment === '') {
                                return msg(res, 400, { message: 'กรุณากรอกความคิดเห็นสถานะการตรวจสอบ!' })
                            }
                        }

                        const cuFiRsr = await mraM.CheckUniqueFormIpdReviewStatusResult({ form_ipd_id: fOFIIBPI.form_ipd_id })
                        if (cuFiRsr) return msg(res, 409, { message: 'มีข้อมูลอยู่ในระบบแล้ว ไม่สามารถมีข้อมูลซ้ำได้' })

                        const FIRSRPayload = {
                            form_ipd_id: fOFIIBPI.form_ipd_id,
                            ...rsD,
                            ...fullnamePayload
                        }
                        await mraM.InsertFormIpdReviewStatusResult(FIRSRPayload)
                    }
                }
            }
        }

        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, fOFIIBPI) // sl = set log
        await mraM.InsertLog(sl)

        return msg(res, 200, { message: 'อัพเดทข้อมูลเสร็จสิ้น!' })
    } catch (err) {
        console.log('UpdateForm : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Remove Form
exports.RemoveData = async (req, res) => {
    try {
        const an = req.params.patient_an // รับค่า AN มาจาก User
        if (!an) return msg(res, 400, { message: 'กรุณากรอก AN ที่ต้องการลบ!' })

        const password = req.body.password
        if (!password) return msg(res, 400, { message: 'กรุณากรอกรหัสผ่านเพื่อยืนยันการลบข้อมูล!' })

        // ตรวจสอบรหัสผ่านก่อนที่จะทำการลบข้อมูล
        const fpib = await mraM.FetchPasswordInBackoffice(req.fullname)
        const cp = await ComparePassword(password, fpib.password)
        if (!cp) return msg(res, 400, { message: "รหัสผ่านไม่ถูกต้อง!" })

        // ตรวจสอบว่ามี AN นี้อยู่ในระบบ MRA หรือไม่?
        const startTime = Date.now()
        const faip = await mraM.FetchAnInPatient({ patient_an: an })
        if (!faip) return msg(res, 404, { message: `ไม่มีข้อมูล ${an} อยู่ในระบบกรุณาตรวจสอบ ${an} เพื่อความถูกต้อง!` })

        const fpiifi = await mraM.FetchPatientIdInFormIpd({ patient_id: faip.patient_id })

        if (fpiifi) {
            await mraM.RemoveFormIpdReviewStatusResult(fpiifi.form_ipd_id)
            await mraM.RemoveFormIpdOverallFindingResult(fpiifi.form_ipd_id)
            await mraM.RemoveFormIpdContentOfMedicalRecordResult(fpiifi.form_ipd_id)
        }

        await mraM.RemoveFormIpd(fpiifi.form_ipd_id)

        const removeP = await mraM.RemovePatient(an)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, removeP) // sl = set log
        await mraM.InsertLog(sl)

        return msg(res, 200, { message: `Removed ${an} successfully!` })
    } catch (err) {
        console.log('RemoveData : ', err)
        return msg(res, 500, { message: err.message })
    }
}