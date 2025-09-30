const { msg } = require("../../../services/message.service")
const { setLog } = require("../../../services/setLog.service")
const chm = require("./hcode.model")

// Function FetchAll
exports.FetchAllHcodes = async (req, res) => {
    try {
        const FaHc = await chm.FetchAllHcodes()

        if (FaHc.length === 0) return msg(res, 404, { message: 'Data not found!' })
            
        return msg(res, 200, { message: "Fetch all data successfully!", data: FaHc })
    } catch (err) {
        console.log('FetchAllHcodes : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Upsert
exports.UpsertHcode = async (req, res) => {
    try {
        const hcodeData = req.body
        if (!hcodeData.hcode || !hcodeData.hcode_name) return msg(res, 400, { message: "กรุณากรอกข้อมูลให้ครบถ้วน!" })

        let hcodeId = ""
        const FaHc = await chm.FetchAllHcodes()
        if (FaHc.length > 0) {
            hcodeData.updated_by = req.fullname
            hcodeId = FaHc.map(i => i.hcode_id)
        } else {
            hcodeData.created_by = req.fullname
            hcodeData.updated_by = req.fullname
        }

        const UHc = await chm.UpsertHcode(hcodeId[0], hcodeData)

        return msg(res, 200, { message: "Upsert data successfully!" })
    } catch (err) {
        console.log('UpsertHcode : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Fetch One
exports.FetchOneHcodeById = async (req, res) => {
    try {
        const hcodeId = req.params.hcodeId

        const startTime = Date.now()
        const FoHcBi = await chm.FetchOneHcodeById(hcodeId)
        if (!FoHcBi) return msg(res, 404, { message: 'Data not found!' })
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, FoHcBi)
        await chm.InsertLog(sl)

        return msg(res, 200, { data: FoHcBi })
    } catch (err) {
        console.log('FetchOneHcodeById : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Delete
exports.RemoveHcode = async (req, res) => {
    try {
        const hcodeId = req.params.hcodeId
        const FoHcBi = await chm.FetchOneHcodeById(hcodeId)
        if (!FoHcBi) return msg(res, 404, { message: 'Data not found!' })

        const CFk = await chm.CheckForeignKey()

        if (CFk.length > 0) {
            let hasReference = false

            for (const row of CFk) {
                const tableName = row.TABLE_NAME
                const columnName = row.COLUMN_NAME

                const checkData = await chm.CheckForeignKeyData(tableName, columnName, hcodeId)

                if (checkData.length > 0) hasReference = true
            }

            // ถ้ามีตารางที่อ้างอิงอยู่ → ห้ามลบ
            if (hasReference) return msg(res, 400, { message: "ไม่สามารถลบได้ เนื่องจากข้อมูลนี้ยังถูกใช้งานอยู่ กรุณาลบหรือแก้ไขข้อมูลที่เกี่ยวข้องก่อน!" })
        }

        const startTime = Date.now()
        const RHc = await chm.RemoveHcode(hcodeId)
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, RHc)
        await chm.InsertLog(sl)

        return msg(res, 200, { message: "Remove successfully!" })
    } catch (err) {
        console.log('RemoveHcode : ', err)
        return msg(res, 500, { message: err.message })
    }
}