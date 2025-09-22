const { msg } = require("../../../services/message.service")
const { setLog } = require("../../../services/setLog.service")
const chm = require("./hcode.model")

// Function FetchAll
exports.FetchAllHcodes = async (req, res) => {
    try {
        const startTime = Date.now()
        const FaHc = await chm.FetchAllHcodes()
        const endTime = Date.now() - startTime

        // Set and Insert Log
        const sl = setLog(req, req.fullname, endTime, FaHc)
        await chm.InsertLog(sl)

        if (FaHc.length === 0) return msg(res, 404, { message: 'Data not found!' })
        return msg(res, 200, { message: "Fetch all data successfully!", data: FaHc })
    } catch (err) {
        console.log('FetchAllHcodes : ', err)
        return msg(res, 500, { message: err.message })
    }
}