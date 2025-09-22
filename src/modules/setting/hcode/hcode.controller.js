const { msg } = require("../../../services/message.service")
const { setLog } = require("../../../services/setLog.service")

// Function FetchAll
exports.FetchAllHcodes = async (req, res) => {
    try {
        const startTime = Date.now()
        return msg(res, 200, { message: "Fetch all data successfully!" })
    } catch (err) {
        console.log('FetchAllHcodes : ', err)
        return msg(res, 500, { message: err.message })
    }
}