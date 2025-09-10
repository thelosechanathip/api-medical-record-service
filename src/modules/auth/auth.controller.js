const { msg } = require("../../services/message.service")
const { setLog } = require("../../services/setLog.service")
const { generateOtp, getOtp } = require("../../services/generateOtp")
const { ComparePassword } = require("../../services/bcrypt")
const { Sign, Verify } = require("../../services/jsonwebtoken")
const { sendTelegramMessage } = require("../../services/telegram")
const am = require("./auth.model")

/*
    นิยามตัวย่อ:
        am = auth model
        fur = fetch user result
        ftr = fetch telegram by person id
        iat = insert auth token
        fuui = fetch user by user id
        uat = update auth token
        st = start time
        et = end time
        sl = set log
*/

// ระบบ Login
exports.AuthLogin = async (req, res) => {
    try {
        const data = req.body

        // Check username and password
        const fur = await am.FetchUser(data.username)
        if (fur.length === 0) return msg(res, 404, { message: "User not found!" })
        const cp = await ComparePassword(data.password, fur[0].password)
        if (!cp) return msg(res, 400, { message: "Password incorrect!" })

        // Check Telegram
        const ftr = await am.FetchTelegramByPersonId(fur[0].person_id)
        if (ftr.length === 0) return msg(res, 404, { message: "Telegram not found!" })

        // Generate Token and Fetch Bot Token
        const token = Sign(fur[0].id, ftr[0].chat_id)
        const botToken = await am.FetchBotToken()

        // Generate OTP and Send to Telegram
        const otpCode = await generateOtp(ftr[0].chat_id)
        await sendTelegramMessage(ftr[0].chat_id, otpCode, botToken[0].token)

        if (token) {
            try {
                const dataToken = Verify(token)
                const exp = new Date(dataToken.exp * 1000) // คูณ 1000 เพราะ timestamp เป็นวินาที แต่ Date ใช้มิลลิวินาที

                const st = Date.now()
                const iat = await am.InsertAuthtoken({ token: token, user_id: fur[0].id, expires_at: exp })
                const et = Date.now() - st

                const sl = setLog(req, fur[0].fullname, et, iat)
                await am.insertLog(sl)

                if (iat) return msg(res, 200, { token: token })
            } catch (err) {
                console.error("Error token:", err.message)
                return msg(res, 500, { message: "Internal Server Error" })
            }
        }
    } catch (err) {
        throw new Error(err.message)
    }
}

// ยืนยันตัวตนด้วยเลข OTP
exports.VerifyOtp = async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return msg(res, 401, { message: 'ไม่มี Token ถูกส่งมา' })

    const token = authHeader.split(' ')[1]

    try {
        const decoded = Verify(token)
        if (!decoded) return msg(res, 401, { message: 'Token ไม่ถูกต้อง' })

        const { otpCode } = req.body
        const chatId = decoded.chatId
        if (!chatId) return msg(res, 401, { message: 'ไม่พบ chatId' })

        const cacheOtp = getOtp(chatId)
        if (!cacheOtp) return msg(res, 400, { message: "OTP หมดอายุหรือไม่ถูกต้อง" })

        if (cacheOtp === otpCode) {
            const fuui = await am.FetchUserByUserId(decoded.id)
            const st = Date.now()
            const uat = await am.UpdateAuthtoken(token)
            const et = Date.now() - st

            const sl = setLog(req, fuui[0].fullname, et, uat)
            await am.insertLog(sl)

            return msg(res, 200, { message: "Login successfully!" })
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return msg(res, 401, { message: 'TokenExpiredError!' })
        } else if (err.name === 'JsonWebTokenError') {
            return msg(res, 401, { message: 'JsonWebTokenError!' })
        }
        console.error('Error verifyToken :', err)
        return msg(res, 500, { message: 'Internal Server Error!' })
    }
}