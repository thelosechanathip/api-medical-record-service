const { msg } = require('../../services/message.service')
const { setLog } = require('../../services/setLog.service')
const { ComparePassword } = require('../../services/bcrypt')
const mraM = require('./mra.model')
const moment = require('moment')
const { cryptoEncode } = require('../../services/crypto.service')

// Function EditTime
function ensureHHMMSS(s) {
    // รับ "14:00" หรือ "14:00:00" -> คืน "HH:mm:ss"
    const m = /^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/.exec(String(s ?? ''))
    if (!m) throw new Error(`Invalid time: ${s}`)

    const h = m[1].padStart(2, '0')
    const mm = m[2]                       // regex บังคับให้เป็น 2 หลักแล้ว
    const ss = (m[3] ?? '00').padStart(2, '0')  // << สำคัญ: เติม '00' ถ้าไม่มีวินาที

    const hi = +h, mi = +mm, si = +ss
    if (hi > 23 || mi > 59 || si > 59) throw new Error(`Out-of-range time: ${s}`)

    return `${h}:${mm}:${ss}`
}

// Function FetchClinicalDetailByCheckStatus
exports.FetchClinicalDetailByCheckStatus = async (req, res) => {
    try {
        const cdId = req.params.cdId
        const FCdBi = await mraM.FetchClinicalDetailById(cdId)

        let clinicalDetailForm
        if (FCdBi.check_status === true) {
            clinicalDetailForm = {
                diagnosis: "",
                visit_date: "",
                review_period_start: "",
                review_period_end: "",
            }
        } else {
            clinicalDetailForm = {
                diagnosis: "",
                visit_date: "",
            }
        }

        return msg(res, 200, { data: clinicalDetailForm })
    } catch (err) {
        console.log('FetchClinicalDetailByCheckStatus : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// FetchOne By VN
exports.FetchOneMedicalRecordAuditOPDByVn = async (req, res) => {
    try {
        const FVIP = await mraM.FetchVnInPatient(req.params.patient_vn)
        if (!FVIP) return msg(res, 404, { message: `${req.params.patient_vn}นี้ไม่มีข้อมูลอยู่ในระบบ!` })

        const startTime = Date.now()
        const FoMraOpd = await mraM.FetchOneMedicalRecordAuditOPD(FVIP.patient_id)
        if (!FoMraOpd) return msg(res, 404, { message: 'Data not found!' })

        const FoPBFoi = await mraM.FetchOnePdfByFormOpdId(FoMraOpd[0].form_opd_id)
        if (FoPBFoi) {
            FoPBFoi.pdf_opd_file = Buffer.from(FoPBFoi.pdf_opd_file).toString('base64')
            return msg(res, 409, { data: FoPBFoi })
        }

        const resultsWithDefaultSum = []

        for (const data of FoMraOpd) {
            let scoreObtained = 0
            let totalScoreSum = 0
            for (const content of data.form_opd_content_of_medical_record_results) {
                if (typeof (content.total_score, content.score_obtained) === 'number') {
                    totalScoreSum += content.total_score
                    scoreObtained += content.score_obtained
                }
            }

            data.totalScoreSum = totalScoreSum
            data.scoreObtained = scoreObtained
            const resultSum = scoreObtained / totalScoreSum * 100
            const formattedResultSum = resultSum.toFixed(2)
            data.formattedResultSum = parseFloat(formattedResultSum)
            resultsWithDefaultSum.push(data)
        }

        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, FoMraOpd)
        await mraM.InsertLog(sl)

        return msg(res, 200, { data: cryptoEncode(resultsWithDefaultSum) })
    } catch (err) {
        console.log('FetchOneMedicalRecordAuditOPDByVn : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function FetchOnePatient
exports.FetchOnePatientData = async (req, res) => {
    try {
        const FPIH = await mraM.FetchPatientInHos(req.params.patient_vn)
        if (!FPIH) return msg(res, 404, { message: `${req.params.patient_vn} นี้ไม่มีข้อมูลอยู่ในระบบ HOSxP!` })

        const FVIP = await mraM.FetchVnInPatient(req.params.patient_vn)
        if (FVIP) return msg(res, 409, { message: `${req.params.patient_vn} นี้มีข้อมูลอยู่ในระบบ MRA แล้วไม่สามารถบันทึกซ้ำได้` })

        if (FPIH.vstdate) FPIH.vstdate = moment(FPIH.vstdate).format('YYYY-MM-DD')
        if (FPIH.regdate) FPIH.regdate = moment(FPIH.regdate).format('YYYY-MM-DD')
        if (FPIH.dchdate) FPIH.dchdate = moment(FPIH.dchdate).format('YYYY-MM-DD')

        return msg(res, 200, { data: cryptoEncode(FPIH) })
    } catch (err) {
        console.log('FetchOnePatientData : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function FetchOnePDF By VN
exports.FetchOnePdfByVn = async (req, res) => {
    try {
        const { patient_vn } = req.params

        const FVIP = await mraM.FetchVnInPatient(patient_vn)
        if (!FVIP) return msg(res, 404, { message: `${patient_vn} นี้ไม่มีข้อมูลอยู่ในระบบ!` })

        const FPiIFo = await mraM.FetchPatientIdInFormOpd(FVIP.patient_id)
        if (!FPiIFo) return msg(res, 404, { message: 'Data not found!' })

        const FoPBFoi = await mraM.FetchOnePdfByFormOpdId(FPiIFo.form_opd_id)
        if (!FoPBFoi) return msg(res, 404, { message: 'Data not found!' })
        FoPBFoi.pdf_opd_file = Buffer.from(FoPBFoi.pdf_opd_file).toString('base64')

        return msg(res, 200, { data: cryptoEncode(FoPBFoi) })
    } catch (err) {
        console.log('FetchOnePdfByVn : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Generate PDF
exports.GeneratePdf = async (req, res) => {
    try {
        const { binary, total_score, score_obtained, percentage, ...data } = req.body

        const FvBFoi = await mraM.FetchVnByFormOpdId(data.form_opd_id)
        if (!FvBFoi) return msg(res, 404, { message: 'Data not found!' })

        const FoPBFoi = await mraM.FetchOnePdfByFormOpdId(data.form_opd_id)
        if (FoPBFoi) return msg(res, 409, { message: 'PDF already exists!' })

        const buffer = Buffer.from(binary, 'base64')

        // Set Data
        data.file_name = FvBFoi.patients.patient_vn + ".pdf"
        data.mime_type = 'application/pdf'
        data.pdf_opd_file = buffer
        data.created_by = req.fullname

        const IP = await mraM.InsertPdf(data)
        if (IP) {
            const setDataUpdateForm = {
                total_score, score_obtained, percentage
            }
            await mraM.UpdateFormOpd(data.form_opd_id, setDataUpdateForm)
        }

        return msg(res, 200, { message: "Generate PDF Successfully!" })
    } catch (err) {
        console.log('GeneratePdf : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function GenerateForm
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

        // ตรวจสอบว่ามีการกรอก VN เข้ามาหรือไม่?
        if (!mraD.patient_vn) return msg(res, 400, { message: 'กรุณากรอก VN ที่ต้องการบันทึก!' })

        // ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_vn
        const fPIM = await mraM.FetchPatientInMra(mraD.patient_vn)

        if (fPIM) {
            // ดึงข้อมูล form_opd_id จำนวน 1 record จากตาราง form_opds อ้างอิงจาก patient_id
            const formData = await mraM.FetchOneFormOpdIdByPatientId(fPIM.patient_id)
            // ดึงข้อมูล review_status_id จำนวน 1 record จากตาราง form_opd_review_status_results อ้างอิงจาก form_opd_id
            const formORSR = await mraM.FetchFormOpdReviewStatusResultsByFormOpdId(formData.form_opd_id)
            if (formORSR) {
                return msg(res, 409, { message: `ได้มีข้อมูลของ ${mraD.patient_vn} อยู่ในระบบแล้ว ไม่อนุญาติให้บันทึกข้อมูลซ้ำ!` })
            } else if (formORSR === null || formORSR === '') {
                /*
                    ดึงข้อมูลทั้งหมดของตาราาง form_opds ที่มีการ join
                        patients,
                        form_opd_content_of_medical_record_results,
                        form_opd_overall_finding_results,
                        form_opd_review_status_results อ้างอิงจาก patient_id
                */
                const result = await mraM.FetchOneMedicalRecordAuditOPD(fPIM.patient_id)
                return msg(res, 200, { data: cryptoEncode(result) })
            }
        }

        // ดึงข้อมูล คนไข้ จำนวน 1 record มาจากระบบ HOSxP อ้างอิงจาก patient_vn
        const fpih = await mraM.FetchPatientInHos(mraD.patient_vn)

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

            // บันทึกข้อมูลไปยังตาราง form_opds
            const ifoe = await mraM.InsertFormOpd(fiPayload)
            if (ifoe) {
                const cdD = mraD.clinical_details
                const FCdBi = await mraM.FetchClinicalDetailById(cdD.clinical_detail_id)
                if (FCdBi.check_status === true) {
                    if (!cdD.review_period_start && !cdD.review_period_end) return msg(res, 400, {
                        message: "กรุณากรอกข้อมูลให้ครบถ้วน เพราะชื่อข้อมูลทางคลินิกนี้จำเป็นต้องกรอกช่วงเวลาที่ตรวจสอบ"
                    })
                    cdD.review_period_start = ensureHHMMSS(cdD.review_period_start)
                    cdD.review_period_end = ensureHHMMSS(cdD.review_period_end)
                } else {
                    cdD.review_period_start = null
                    cdD.review_period_end = null
                }

                cdD.visit_date = new Date(cdD.visit_date)

                const cdPayload = {
                    form_opd_id: ifoe.form_opd_id,
                    ...cdD,
                    ...fullnamePayload
                }
                const IFoeCdr = await mraM.InsertFormOpdClinicalDetailResult(cdPayload)
                if (IFoeCdr) {
                    /*
                        ดึงข้อมูลทั้งหมด content_of_medical_record_id จากตาราง content_of_medical_records
                        อ้างอิงจาก patient_service_id
                        และเรียงลำดับจากน้อยไปมากโดยอ้างอิง priority
                    */
                    const fComri = await mraM.FetchContentOfMedicalRecordByPatientId(ps.patient_service_id)
                    // Set ข้อมูลก่อนที่จะทำการสร้าง Form ContentOfmedicalRecordResult
                    const setComrPayload = fComri.map((item) => {
                        return {
                            form_opd_id: ifoe.form_opd_id,
                            ...item,
                            ...fullnamePayload
                        }
                    })
                    // บันทึกข้อมูลไปยังตาราง form_opd_content_of_medical_record_results แบบหลาย record พร้อมกัน
                    await mraM.InsertFormOpdContentOfMedicalRecordResult(setComrPayload)
                }
            }
        }

        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, ip)
        await mraM.InsertLog(sl)

        /*
            ดึงข้อมูลทั้งหมดของตาราง form_opds
            join
                patients, form_opd_content_of_medical_record_results, form_opd_overall_finding_results, form_opd_review_status_results
            อ้างอิงจาก
                patient_id
        */
        const result = await mraM.FetchOneMedicalRecordAuditOPD(ip.patient_id)
        return msg(res, 200, { data: cryptoEncode(result) })
    } catch (err) {
        console.log('GenerateForm : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Functipn Update
exports.UpdateForm = async (req, res) => {
    try {
        const data = req.body // รับค่า body มาจาก User

        // Set ข้อมูลของผู้ที่อัพเดทข้อมูล
        const fullnamePayload = { updated_by: req.fullname }

        const startTime = Date.now()
        const faip = await mraM.FetchVnInPatient(req.params.patient_vn) // ดึงข้อมูล patient_id จากตาราง patients อ้างอิงจาก patient_vn
        if (!faip) return msg(res, 404, { message: `ไม่พอข้อมูล ${vn} นี่ในระบบ MRA OPD` })

        const fOFOIBPI = await mraM.FetchOneFormOpdIdByPatientId(faip.patient_id) // ดึงข้อมูล form_ipd_id จากตาราง form_ipds อ้างอิงจาก patient_id
        if (fOFOIBPI) {
            const { content } = data // แยกข้อมูล content ออกมาจาก body

            // ตรวจสอบค่า Array ที่ส่งมาพร้อมกันว่ามีซ้ำหรือไม่?
            let ContentErrorResult = []
            let ContentErrorStatus = []

            for (row of content) {
                /*
                    ดึงข้อมูล 1 record จากตาราง form_opd_content_of_medical_record_results
                    อ้างอิงจาก
                        form_opd_content_of_medical_record_result_id, content_of_medical_record_id
                */
                const FoFoComrr = await mraM.FetchOneFormOpdContentOfMedicalRecordResult(
                    row.form_opd_content_of_medical_record_result_id, row.content_of_medical_record_id
                )
                if (!FoFoComrr) {
                    ContentErrorStatus.push(404)
                    ContentErrorResult.push(
                        `ไม่พอข้อมูล ${row.form_opd_content_of_medical_record_result_id} หรือ ${row.content_of_medical_record_id} นี่ในระบบ MRA OPD`
                    )
                    continue
                }

                const FFudBFudt = await mraM.FetchFollowUpDateByFollowUpDateType(
                    row.content_of_medical_record_id
                )
                if (FFudBFudt.follow_up_date_type === true) {
                    if (!row.follow_up_date) {
                        ContentErrorStatus.push(400)
                        ContentErrorResult.push(
                            `กรุณากรอกข้อมูล follow_up_date ด้วย`
                        )
                        continue
                    } else {
                        row.follow_up_date = new Date(row.follow_up_date)
                    }
                } else {
                    row.follow_up_date = null
                }
            }
            // ถ้าไม่พอข้อมูลในระบบ MRA OPD จะ return 404
            if (ContentErrorResult.length > 0) return msg(res, ContentErrorStatus[0], { message: ContentErrorResult.join(" AND ") })

            // คีย์ที่ไม่ต้องการให้รวมในการคำนวณ (ยกเว้น point_deducted ที่จะลบทีหลัง)
            const excludedKeys = [
                "form_opd_content_of_medical_record_result_id",
                "form_opd_id",
                "content_of_medical_record_id",
                "na",
                "missing",
                "comment",
                "total_score", // ถ้ามีอยู่ในข้อมูลเดิม จะไม่รวม
                "point_awarded", // จะแยกไปบวกทีหลัง
                "point_deducted", // จะแยกไปลบทีหลัง
                "follow_up_date"
            ]

            const rFOCOMR = content.map(item => {
                const keys = Object.keys(item).filter(k => !excludedKeys.includes(k))
                const totalScore = keys.length

                let scoreObtained

                // 1) ถ้าต้องการเซตทุกค่านอก excludedKeys เป็น 0 เมื่อ na/missing เป็น true
                if (item.na || item.missing) {
                    keys.forEach(k => item[k] = 0)
                    item.point_awarded = 0
                    item.point_deducted = 0
                    scoreObtained = 0
                } else {
                    const itemSum = keys.reduce((acc, k) => acc + (Number(item[k]) || 0), 0)
                    // ลบ point_deducted
                    scoreObtained = itemSum + (Number(item.point_awarded) || 0) - (Number(item.point_deducted) || 0)
                    if (scoreObtained > totalScore) scoreObtained = totalScore
                }

                return {
                    ...item,
                    total_score: totalScore,
                    score_obtained: scoreObtained,
                    ...fullnamePayload
                }
            })

            /*
                อัพเดทข้อมูลไปยังตาราง form_opd_content_of_medical_record_results
                อ้างอิงจาก
                    formOpdId, content_of_medical_record_id, form_opd_content_of_medical_record_result_id
            */
            const updatePromissFOCOMR = rFOCOMR.map(i =>
                mraM.UpdateFormOpdContentOfMedicalRecordResult(i, fOFOIBPI.form_opd_id)
            )
            await Promise.all(updatePromissFOCOMR)
            if (updatePromissFOCOMR) {
                const { content, ...rsD } = data
                if (Object.keys(rsD).length > 0 && rsD.review_status_id !== null) {
                    fullnamePayload.created_by = req.fullname

                    // ดึงข้อมูล review_status_type จำนวน 1 record จากตาราง review_status อ้างอิงจาก review_status_id
                    const foRstORs = await mraM.FetchOneRSTOnReviewStatus(rsD.review_status_id)
                    if (foRstORs.review_status_type === true) {
                        if (rsD.review_status_comment === null || rsD.review_status_comment === '') {
                            return msg(res, 400, { message: 'กรุณากรอกความคิดเห็นสถานะการตรวจสอบ!' })
                        }
                    }

                    // ดึงข้อมูล form_opd_id จำนวน 1 record จากตาราง form_opd_review_status_results อ้างอิงจาก form_opd_id
                    const cuFoRsr = await mraM.CheckUniqueFormOpdReviewStatusResult(fOFOIBPI.form_opd_id)
                    if (cuFoRsr) return msg(res, 409, { message: 'มีข้อมูลอยู่ในระบบแล้ว ไม่สามารถมีข้อมูลซ้ำได้!' })

                    const FORSRPayload = {
                        form_opd_id: fOFOIBPI.form_opd_id,
                        ...rsD,
                        ...fullnamePayload
                    }
                    // บันทึกข้อมูลไปยังตาราง form_opd_review_status_results
                    await mraM.InsertFormOpdReviewStatusResult(FORSRPayload)
                }
            }
        }

        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, fOFOIBPI) // sl = set log
        await mraM.InsertLog(sl)

        return msg(res, 200, { message: "อัพเดทข้อมูลเสร็จสิ้น!" })
    } catch (err) {
        console.log('UpdateForm : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function RemoveData
exports.RemoveData = async (req, res) => {
    try {
        const vn = req.params.patient_vn // รับค่า VN มาจาก User
        if (!vn) return msg(res, 400, { message: 'กรุณากรอก VN ที่ต้องการลบ!' })

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

        // ดึงข้อมูล patient_id จำนวน 1 record จากตาราง patients อ้างอิงจาก patient_vn
        const fvip = await mraM.FetchVnInPatient(vn)
        if (!fvip) return msg(res, 404, { message: `ไม่มีข้อมูล ${vn} อยู่ในระบบกรุณาตรวจสอบ ${vn} เพื่อความถูกต้อง!` })

        // ดึงข้อมูล form_opd_id จำนวน 1 record จากตาราง form_opds อ้างอิงจาก patient_id
        const fpiifi = await mraM.FetchPatientIdInFormOpd(fvip.patient_id)
        if (fpiifi && fpiifi != null) {
            // Remove ข้อมูล form_opd_review_status_results จำนวนหลาย record อ้างอิงจาก form_opd_id
            await mraM.RemoveFormOpdReviewStatusResult(fpiifi.form_opd_id)

            // Remove ข้อมูล form_opd_content_of_medical_record_results จำนวนหลาย record อ้างอิงจาก form_opd_id
            await mraM.RemoveFormOpdContentOfMedicalRecordResult(fpiifi.form_opd_id)

            // Remove ข้อมูล form_opd_content_of_medical_record_results จำนวนหลาย record อ้างอิงจาก form_opd_id
            await mraM.RemoveFormClinicalDetailResult(fpiifi.form_opd_id)

            await mraM.RemovePdf(fpiifi.form_opd_id)

            // Remove ข้อมูล form_opds จำนวน 1 record อ้างอิงจาก form_opd_id
            await mraM.RemoveFormOpd(fpiifi.form_opd_id)
        }

        // Remove ข้อมูล patients จำนวน 1 record อ้างอิงจาก patient_vn และส่งค่า patient_id ที่ลบแล้วกลับคืน
        const removeP = await mraM.RemovePatient(vn)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, removeP) // sl = set log
        await mraM.InsertLog(sl)

        return msg(res, 200, { message: `Removed ${vn} successfully!` })
    } catch (err) {
        console.log('RemoveData : ', err)
        return msg(res, 500, { message: err.message })
    }
}