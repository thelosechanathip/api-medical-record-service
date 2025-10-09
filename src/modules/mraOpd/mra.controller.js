const { msg } = require('../../services/message.service')
const { setLog } = require('../../services/setLog.service')
const { ComparePassword } = require('../../services/bcrypt')
const mraM = require('./mra.model')
const moment = require('moment')


function ensureHHMMSS(s) {
    // รับได้ทั้ง "14:00" หรือ "14:00:00" คืนเป็น "HH:mm:ss"
    const m = String(s || '').match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    if (!m) throw new Error(`Invalid time: ${s}`)
    const [h, mm, ss = '00'] = [m[1].padStart(2, '0'), m[2], m[3].padStart(2, '0')]
    if (+h > 23 || +mm > 59 || +ss > 59) throw new Error(`Out-of-range time: ${s}`)
    return `${h}:${mm}:${ss}`
}

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

// Fetch One Patient
exports.FetchOnePatientData = async (req, res) => {
    try {
        const FPIH = await mraM.FetchPatientInHos(req.params.patient_vn)
        if (!FPIH) return msg(res, 404, { message: `${req.params.patient_vn} นี้ไม่มีข้อมูลอยู่ในระบบ HOSxP!` })

        const FVIP = await mraM.FetchVnInPatient(req.params.patient_vn)
        if (FVIP) return msg(res, 409, { message: `${req.params.patient_vn} นี้มีข้อมูลอยู่ในระบบ MRA แล้วไม่สามารถบันทึกซ้ำได้` })

        if (FPIH.vstdate) FPIH.vstdate = moment(FPIH.vstdate).format('YYYY-MM-DD')
        if (FPIH.regdate) FPIH.regdate = moment(FPIH.regdate).format('YYYY-MM-DD')
        if (FPIH.dchdate) FPIH.dchdate = moment(FPIH.dchdate).format('YYYY-MM-DD')

        return msg(res, 200, { data: FPIH })
    } catch (err) {
        console.log('FetchOnePatientData : ', err)
        return msg(res, 500, { message: err.message })
    }
}

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
        const result = await mraM.FetchOneMedicalRecordAuditOpd(ip.patient_id)
        return msg(res, 200, { data: result })
    } catch (err) {
        console.log('GenerateForm : ', err)
        return msg(res, 500, { message: err.message })
    }
}

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