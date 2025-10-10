const { msg } = require('../../services/message.service')
const { setLog } = require('../../services/setLog.service')
const { ComparePassword } = require('../../services/bcrypt')
const mraM = require('./mra.model')
const moment = require('moment')

exports.FetchOneReviewStatusByPatientServiceId = async (req, res) => {
    try {
        const ps = await mraM.FetchOnePatientService()

        const startTime = Date.now()
        const FoRsBPsi = await mraM.FetchOneReviewStatusByPatientServiceId(ps.patient_service_id)
        if (!FoRsBPsi) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, FoRsBPsi)
        await mraM.InsertLog(sl)

        return msg(res, 200, { data: FoRsBPsi })
    } catch (err) {
        console.log('FetchOneReviewStatusByPatientServiceId : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Fetch One By An
exports.FetchOneMedicalRecordAuditIPDByAn = async (req, res) => {
    try {
        const FAIP = await mraM.FetchAnInPatient(req.params.patient_an)
        if (!FAIP) return msg(res, 404, { message: `${req.params.patient_an}นี้ไม่มีข้อมูลอยู่ในระบบ!` })

        const startTime = Date.now()
        const FoMraIpd = await mraM.FetchOneMedicalRecordAuditIPD(FAIP.patient_id)
        if (!FoMraIpd) return msg(res, 404, { message: 'Data not found!' })

        const FoPBFii = await mraM.FetchOnePdfByFormIpdId(FoMraIpd[0].form_ipd_id)
        if (FoPBFii) {
            FoPBFii.pdf_ipd_file = Buffer.from(FoPBFii.pdf_ipd_file).toString('base64')
            return msg(res, 409, { data: FoPBFii })
        }

        const resultsWithDefaultSum = []

        for (const data of FoMraIpd) {
            let totalDefaultSum = 0
            let totalScoreSum = 0
            for (const content of data.form_ipd_content_of_medical_record_results) {
                if (content.na === false && content.missing === false && content.no === false) {
                    const comrId = content.content_of_medical_records.content_of_medical_record_id

                    const checkType = await mraM.FetchTypeContentOfMedicalRecordById(comrId)
                    const comrKeys = Object.keys(checkType).filter(k => k.startsWith("criterion_number_"))
                    const itemSum = comrKeys.reduce((acc, key) => {
                        const value = checkType[key]
                        if (value === true) {
                            return acc + 1
                        }
                        return acc
                    }, 0)
                    totalDefaultSum += itemSum

                    if (typeof content.total_score === 'number') {
                        totalScoreSum += content.total_score
                    }
                }
            }
            data.totalDefaultSum = totalDefaultSum
            data.totalScoreSum = totalScoreSum
            const resultSum = totalScoreSum / totalDefaultSum * 100
            const formattedResultSum = resultSum.toFixed(2)
            data.formattedResultSum = parseFloat(formattedResultSum)
            resultsWithDefaultSum.push(data)
        }

        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, FoMraIpd)
        await mraM.InsertLog(sl)

        return msg(res, 200, { data: resultsWithDefaultSum })
    } catch (err) {
        console.log('FetchOneMedicalRecordAuditIPDByAn : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Fetch One Patient
exports.FetchOnePatientData = async (req, res) => {
    try {
        const FPIH = await mraM.FetchPatientInHos(req.params.patient_an)
        if (!FPIH) return msg(res, 404, { message: `${req.params.patient_an}นี้ไม่มีข้อมูลอยู่ในระบบ HOSxP!` })

        const FAIP = await mraM.FetchAnInPatient(req.params.patient_an)
        if (FAIP) return msg(res, 409, { message: `${req.params.patient_an} นี้มีข้อมูลอยู่ในระบบ MRA แล้วไม่สามารถบันทึกซ้ำได้` })

        FPIH.vstdate = moment(FPIH.vstdate).format('YYYY-MM-DD')
        FPIH.regdate = moment(FPIH.regdate).format('YYYY-MM-DD')
        FPIH.dchdate = moment(FPIH.dchdate).format('YYYY-MM-DD')

        return msg(res, 200, { data: FPIH })
    } catch (err) {
        console.log('FetchOnePatientData : ', err)
        return msg(res, 500, { message: err.message })
    }
}

exports.FetchOnePdfByAn = async (req, res) => {
    try {
        const { patient_an } = req.params

        const FAIP = await mraM.FetchAnInPatient(patient_an)
        if (!FAIP) return msg(res, 404, { message: `${patient_an} นี้ไม่มีข้อมูลอยู่ในระบบ!` })

        const FPiIFi = await mraM.FetchPatientIdInFormIpd(FAIP.patient_id)
        if (!FPiIFi) return msg(res, 404, { message: 'Data not found!' })

        const FoPBFii = await mraM.FetchOnePdfByFormIpdId(FPiIFi.form_ipd_id)
        if (!FoPBFii) return msg(res, 404, { message: 'Data not found!' })
        FoPBFii.pdf_ipd_file = Buffer.from(FoPBFii.pdf_ipd_file).toString('base64')

        return msg(res, 200, { data: FoPBFii })
    } catch (err) {
        console.log('FetchOnePdfByAn : ', err)
        return msg(res, 500, { message: err.message })
    }
}

exports.GeneratePdf = async (req, res) => {
    try {
        const { binary, total_score, score_obtained, percentage, ...data } = req.body

        const FaBFii = await mraM.FetchAnByFormIpdId(data.form_ipd_id)
        if (!FaBFii) return msg(res, 404, { message: 'Data not found!' })

        const FoPBFii = await mraM.FetchOnePdfByFormIpdId(data.form_ipd_id)
        if (FoPBFii) return msg(res, 409, { message: 'PDF already exists!' })

        const buffer = Buffer.from(binary, 'base64')

        // Set Data
        data.file_name = FaBFii.patients.patient_an + ".pdf"
        data.mime_type = 'application/pdf'
        data.pdf_ipd_file = buffer
        data.created_by = req.fullname

        const IP = await mraM.InsertPdf(data)
        if (IP) {
            const setDataUpdateForm = {
                total_score, score_obtained, percentage
            }
            await mraM.UpdateFormIpd(data.form_ipd_id, setDataUpdateForm)
        }

        return msg(res, 200, { message: "Generate PDF Successfully!" })
    } catch (err) {
        console.log('GeneratePdf : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// สร้าง Form
exports.GenerateForm = async (req, res) => {
    // รับค่าจาก User
    const mraD = req.body

    // ดึงข้อมูล patient_service_id จำนวน 1 record จากตาราง patient_services อ้างอิงจาก patient_service_name_english
    const ps = await mraM.FetchOnePatientService()

    try {
        // ดึงข้อมูล hcode_id จำนวน 1 record จากตาราง hcodes
        const fh = await mraM.FetchHcode()

        // เตรียมข้อมูลของผู้ใช้งาน
        const fullnamePayload = {
            created_by: req.fullname,
            updated_by: req.fullname
        }

        // ตรวจสอบว่ามีการกรอก AN เข้ามาหรือไม่?
        if (!mraD.patient_an) return msg(res, 400, { message: 'กรุณากรอก AN ที่ต้องการบันทึก!' })

        // ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_an
        const fPIM = await mraM.FetchPatientInMra(mraD.patient_an)
        if (fPIM) {
            // ดึงข้อมูล form_ipd_id จำนวน 1 record จากตาราง form_ipds อ้างอิงจาก patient_id
            const formData = await mraM.FetchOneFormIpdIdByPatientId(fPIM.patient_id)

            // ดึงข้อมูล review_status_id จำนวน 1 record จากตาราง form_ipd_review_status_results อ้างอิงจาก form_ipd_id
            const formIRSR = await mraM.FetchFormIRSRInMra(formData.form_ipd_id)
            if (formIRSR) {
                return msg(res, 409, { message: `ได้มีข้อมูลของ ${mraD.patient_an} อยู่ในระบบแล้ว ไม่อนุญาติให้บันทึกข้อมูลซ้ำ!` })
            } else if (formIRSR === null || formIRSR === '') {
                /*
                    ดึงข้อมูลทั้งหมดของตาราาง form_ipds ที่มีการ join
                        patients,
                        form_ipd_content_of_medical_record_results,
                        form_ipd_overall_finding_results,
                        form_ipd_review_status_results อ้างอิงจาก patient_id
                */
                const result = await mraM.FetchOneMedicalRecordAuditIPD(fPIM.patient_id)
                // const result = await mraM.FetchOnePdfByFormIpdId(formData.form_ipd_id)
                return msg(res, 200, { data: result })
            }
        }

        // ดึงข้อมูล คนไข้ จำนวน 1 record มาจากระบบ HOSxP อ้างอิงจาก patient_an
        const fpih = await mraM.FetchPatientInHos(mraD.patient_an)

        // Set ข้อมูลคนไข้ก่อนที่จะบันทึกไปยัง MRA ตาราง patients
        const pPayload = {
            hcode_id: fh.hcode_id,
            patient_fullname: fpih.fullname,
            patient_hn: fpih.hn,
            patient_vn: fpih.vn,
            patient_an: fpih.an,
            patient_cid: fpih.cid,
            patient_ward: fpih.ward_name,
            patient_date_service: fpih.vstdate,
            patient_date_admitted: fpih.regdate,
            patient_date_discharged: fpih.dchdate,
            ...fullnamePayload
        }

        const startTime = Date.now()

        // บันทึกข้อมูลไปยังตาราง patients
        const ip = await mraM.InsertPatient(pPayload)
        if (ip) {
            // Set ข้อมูลคนไข้ก่อนที่จะทำการสร้าง Form สำหรับบันทึกข้อมูล
            const fiPayload = {
                patient_id: ip.patient_id,
                ...fullnamePayload
            }

            // บันทึกข้อมูลไปยังตาราง form_ipds
            const ifi = await mraM.InsertFormIpd(fiPayload)
            if (ifi) {
                /*
                    ดึงข้อมูลทั้งหมด content_of_medical_record_id จากตาราง content_of_medical_records
                    อ้างอิงจาก patient_service_id
                    และเรียงลำดับจากน้อยไปมากโดยอ้างอิง priority
                */
                const fComri = await mraM.FetchContentOfMedicalRecordByPatientId(ps.patient_service_id)
                // Set ข้อมูลก่อนที่จะทำการสร้าง Form ContentOfmedicalRecordResult
                const setComrPayload = fComri.map((item) => {
                    return {
                        form_ipd_id: ifi.form_ipd_id,
                        ...item,
                        ...fullnamePayload
                    }
                })
                // บันทึกข้อมูลไปยังตาราง form_ipd_content_of_medical_record_results แบบหลาย record พร้อมกัน
                const iFiComdrr = await mraM.InsertFormIpdContentOfMedicalRecordResult(setComrPayload)
                if (iFiComdrr) {
                    // ดึงข้อมูลทั้งหมด overall_finding_id จากตาราง overall_finding อ้างอิงจาก patient_service_id และเรียงลำดับจากน้อยไปมากโดยอ้างอิง priority
                    const fOf = await mraM.FetchOverallFindingByPatientId(ps.patient_service_id)
                    const setOfPayload = fOf.map((item) => {
                        return {
                            form_ipd_id: ifi.form_ipd_id,
                            ...item,
                            ...fullnamePayload
                        }
                    })
                    // บันทึกข้อมูลไปยังตาราง form_ipd_overall_finding_results แบบหลาย record พร้อมกัน
                    await mraM.InsertFormIpdOverallFindingResult(setOfPayload)
                }
            }
        }

        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, ip)
        await mraM.InsertLog(sl)

        /*
            ดึงข้อมูลทั้งหมดของตาราง form_ipds
            join
                patients, form_ipd_content_of_medical_record_results, form_ipd_overall_finding_results, form_ipd_review_status_results
            อ้างอิงจาก
                patient_id
        */
        const result = await mraM.FetchOneMedicalRecordAuditIPD(ip.patient_id)
        return msg(res, 200, { data: result })
    } catch (err) {
        console.log('GenerateForm : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Update data to Form
exports.UpdateForm = async (req, res) => {
    try {
        const data = req.body // รับค่า body มาจาก User

        // Set ข้อมูลของผู้ที่อัพเดทข้อมูล
        const fullnamePayload = { updated_by: req.fullname }

        const startTime = Date.now()
        const faip = await mraM.FetchAnInPatient(req.params.patient_an) // ดึงข้อมูล patient_id จากตาราง patients อ้างอิงจาก patient_an
        if (!faip) return msg(res, 404, { message: `ไม่พอข้อมูล ${an} นี่ในระบบ MRA IPD` })

        const fOFIIBPI = await mraM.FetchOneFormIpdIdByPatientId(faip.patient_id) // ดึงข้อมูล form_ipd_id จากตาราง form_ipds อ้างอิงจาก patient_id
        if (fOFIIBPI) {
            const { content } = data // แยกข้อมูล content ออกมาจาก body

            // ตรวจสอบค่า Array ที่ส่งมาพร้อมกันว่ามีซ้ำหรือไม่?
            let ContentErrorResult = []
            // let ContentTypeErrorResult = []
            for (row of content) {
                /*
                    ดึงข้อมูล 1 record จากตาราง form_ipd_content_of_medical_record_results
                    อ้างอิงจาก
                        form_ipd_content_of_medical_record_result_id, content_of_medical_record_id
                */
                const FoFiComrr = await mraM.FetchOneFormIpdContentOfMedicalRecordResult(
                    row.form_ipd_content_of_medical_record_result_id, row.content_of_medical_record_id
                )
                if (!FoFiComrr) {
                    ContentErrorResult.push(
                        `ไม่พอข้อมูล ${row.form_ipd_content_of_medical_record_result_id} หรือ ${row.content_of_medical_record_id} นี่ในระบบ MRA IPD`
                    )
                    continue
                }

                // // ค้นหา Key ของ Object ที่คำนำหน้าว่า: criterion_number_
                // const cutWordCn = Object.entries(row).filter(([k, v]) => k.startsWith("criterion_number_")).map(([k, v]) => k)
                // for (k of cutWordCn) {
                //     const field = k.endsWith("_type") ? k : `${k}_type`
                //     /*
                //         ดึงข้อมูล
                //             content_of_medical_record_name, criterion_number_1-9_type
                //         จากตาราง
                //             content_of_medical_records
                //         อ้างอิงจาก
                //             content_of_medical_record_id
                //     */
                //     const t1 = await mraM.FetchOneContentOfMedicalRecordById(row.content_of_medical_record_id, field)
                //     if (t1) {
                //         // สร้างตัวแปร v เพื่อเก็บค่าของ field (t1: value อ้างอิงตาม field: key)
                //         const v = t1[field]
                //         if (v === false) {
                //             ContentTypeErrorResult.push(
                //                 `ไม่สามารถบันทึกข้อมูลได้เนื่องจาก เกณฑ์ข้อ: ${Object.keys(t1)[0].match(/\d+/)[0]} ของหัวข้อ: ` +
                //                 `${t1.content_of_medical_record_name} ไม่ได้อนุญาตให้กรอกคะแนน`
                //             )
                //             continue
                //         }
                //     }
                // }
            }

            // if (ContentTypeErrorResult.length > 0) return msg(res, 400, { message: ContentTypeErrorResult.join(" AND ") })

            if (ContentErrorResult.length > 0) return msg(res, 404, { message: ContentErrorResult.join(" AND ") }) // ถ้าไม่พอข้อมูลในระบบ MRA IPD จะ return 404

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

            /*
                อัพเดทข้อมูลไปยังตาราง form_ipd_content_of_medical_record_results
                อ้างอิงจาก
                    formIpdId, content_of_medical_record_id, form_ipd_content_of_medical_record_result_id
            */
            const updatePromissFICOMR = rFICOMR.map(i =>
                mraM.UpdateFormIpdContentOfMedicalRecordResult(i, fOFIIBPI.form_ipd_id)
            )
            await Promise.all(updatePromissFICOMR)

            if (updatePromissFICOMR) {
                const { overall } = data
                if (overall) {
                    let OverallErrorResult = []
                    for (i of overall) {
                        /*
                            ดึงข้อมูล 1 record จากตาราง form_ipd_overall_finding_results
                            อ้างอิงจาก
                                form_ipd_overall_finding_result_id, overall_finding_id
                        */
                        const result = await mraM.FetchOneFormIpdOverallFindingResult(
                            i.form_ipd_overall_finding_result_id, i.overall_finding_id
                        )
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

                    /*
                        อัพเดทข้อมูลไปยังตาราง form_ipd_overall_finding_results
                        อ้างอิงจาก
                            form_ipd_id, overall_finding_id, form_ipd_overall_finding_result_id
                    */
                    const updatePromissesFIOF = rFIOF.map(i =>
                        mraM.UpdateFormIpdOverallFindingResult(i, fOFIIBPI.form_ipd_id)
                    )
                    await Promise.all(updatePromissesFIOF)

                    if (updatePromissesFIOF) {
                        const { content, overall, ...rsD } = data
                        if (Object.keys(rsD).length > 0 && rsD.review_status_id !== null) {
                            fullnamePayload.created_by = req.fullname

                            // ดึงข้อมูล review_status_type จำนวน 1 record จากตาราง review_status อ้างอิงจาก review_status_id
                            const foRstORs = await mraM.FetchOneRSTOnReviewStatus(rsD.review_status_id)
                            if (foRstORs.review_status_type === true) {
                                if (rsD.review_status_comment === null || rsD.review_status_comment === '') {
                                    return msg(res, 400, { message: 'กรุณากรอกความคิดเห็นสถานะการตรวจสอบ!' })
                                }
                            }

                            // ดึงข้อมูล form_ipd_id จำนวน 1 record จากตาราง form_ipd_review_status_results อ้างอิงจาก form_ipd_id
                            const cuFiRsr = await mraM.CheckUniqueFormIpdReviewStatusResult(fOFIIBPI.form_ipd_id)
                            if (cuFiRsr) return msg(res, 409, { message: 'มีข้อมูลอยู่ในระบบแล้ว ไม่สามารถมีข้อมูลซ้ำได้!' })

                            const FIRSRPayload = {
                                form_ipd_id: fOFIIBPI.form_ipd_id,
                                ...rsD,
                                ...fullnamePayload
                            }
                            // บันทึกข้อมูลไปยังตาราง form_ipd_review_status_results
                            await mraM.InsertFormIpdReviewStatusResult(FIRSRPayload)
                        }
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

        const prefixPattern = /^(นาย|นางสาว|นาง|นส.|น\.ส\.|ด\.ช\.|ด\.ญ\.|คุณ|พญ\.)\s*/
        const fullname = req.fullname
        const cleanedName = fullname.replace(prefixPattern, '').trim()

        // ดึงข้อมูล password จำนวน 1 record มาจากระบบ Backoffice อ้างอิงจาก fullname
        const fpib = await mraM.FetchPasswordInBackoffice(cleanedName)
        const cp = await ComparePassword(password, fpib.password)
        if (!cp) return msg(res, 400, { message: "รหัสผ่านไม่ถูกต้อง!" })

        const startTime = Date.now()

        // ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_an
        const faip = await mraM.FetchAnInPatient(an)
        if (!faip) return msg(res, 404, { message: `ไม่มีข้อมูล ${an} อยู่ในระบบกรุณาตรวจสอบ ${an} เพื่อความถูกต้อง!` })

        // ดึงข้อมูล form_ipd_id จำนวน 1 record จากตาราง form_ipds อ้างอิงจาก patient_id
        const fpiifi = await mraM.FetchPatientIdInFormIpd(faip.patient_id)

        if (fpiifi) {
            // Remove ข้อมูล form_ipd_review_status_results จำนวนหลาย record อ้างอิงจาก form_ipd_id
            await mraM.RemoveFormIpdReviewStatusResult(fpiifi.form_ipd_id)

            // Remove ข้อมูล form_ipd_overall_finding_results จำนวนหลาย record อ้างอิงจาก form_ipd_id
            await mraM.RemoveFormIpdOverallFindingResult(fpiifi.form_ipd_id)

            // Remove ข้อมูล form_ipd_content_of_medical_record_results จำนวนหลาย record อ้างอิงจาก form_ipd_id
            await mraM.RemoveFormIpdContentOfMedicalRecordResult(fpiifi.form_ipd_id)

            await mraM.RemovePdf(fpiifi.form_ipd_id)
        }

        // Remove ข้อมูล form_ipds จำนวน 1 record อ้างอิงจาก form_ipd_id
        await mraM.RemoveFormIpd(fpiifi.form_ipd_id)

        // Remove ข้อมูล patients จำนวน 1 record อ้างอิงจาก patient_an และส่งค่า patient_id ที่ลบแล้วกลับคืน
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
