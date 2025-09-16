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
        uato = update auth token otp
        uatoia = update auth token is active
        st = start time
        et = end time
        sl = set log
        iatbl = insert auth token blacklist
*/

// Function Login
exports.AuthLogin = async (req, res) => {
    try {
        const data = req.body

        // Check username and password
        const fur = await am.FetchUser(data.username)
        if (fur.length === 0) return msg(res, 404, { message: "User not found!" })
        const cp = await ComparePassword(data.password, fur.password)
        if (!cp) return msg(res, 400, { message: "Password incorrect!" })

        // Check Telegram
        const ftr = await am.FetchTelegramByPersonId(fur.person_id)
        if (ftr.length === 0) return msg(res, 404, { message: "Telegram not found!" })

        // Generate Token and Fetch Bot Token
        const token = await Sign(fur.id, ftr.chat_id)
        const botToken = await am.FetchBotToken()

        // Generate OTP and Send to Telegram
        const otpCode = await generateOtp(ftr.chat_id)
        await sendTelegramMessage(ftr.chat_id, otpCode, botToken.token)

        if (token) {
            const dataToken = await Verify(token)
            const exp = new Date(dataToken.exp * 1000) // คูณ 1000 เพราะ timestamp เป็นวินาที แต่ Date ใช้มิลลิวินาที

            const st = Date.now()
            const iat = await am.InsertAuthtoken({ token: token, user_id: fur.id, expires_at: exp })
            const et = Date.now() - st

            const sl = setLog(req, fur.fullname, et, iat)
            await am.InsertLog(sl)

            if (iat) return msg(res, 200, { token: token })
        }
    } catch (err) {
        console.log('AuthLogin : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Verify OTP
exports.VerifyOtp = async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return msg(res, 401, { message: 'ไม่มี Token ถูกส่งมา' })

    const token = authHeader.split(' ')[1]

    try {
        const decoded = await Verify(token)
        if (!decoded) return msg(res, 401, { message: 'Token ไม่ถูกต้อง' })

        const { otpCode } = req.body
        const chatId = decoded.chatId
        if (!chatId) return msg(res, 401, { message: 'ไม่พบ chatId' })

        const cacheOtp = await getOtp(chatId)
        if (!cacheOtp) return msg(res, 400, { message: "OTP หมดอายุหรือไม่ถูกต้อง" })

        if (cacheOtp === otpCode) {
            const fuui = await am.FetchUserByUserId(decoded.userId)

            const st = Date.now()
            const uato = await am.UpdateAuthtokenOtp(token)
            const et = Date.now() - st

            const sl = setLog(req, fuui.fullname, et, uato)
            await am.InsertLog(sl)

            return msg(res, 200, { message: "Login successfully!" })
        } else {
            return msg(res, 400, { message: "OTP ไม่ถูกต้อง" });
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

// Function Verify
exports.Verify = async (req, res) => {
    const userId = req.user.userId
    try {
        const st = Date.now()
        const fuui = await am.FetchUserByUserId(userId)
        const et = Date.now() - st

        const sl = setLog(req, fuui.fullname, et, fuui)
        await am.InsertLog(sl)

        return msg(res, 200, { data: fuui })
    } catch (err) {
        console.log('Verify : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function Logout
exports.Logout = async (req, res) => {
    const user = req.user
    const token = req.token
    try {
        const fuui = await am.FetchUserByUserId(user.userId)

        const exp = new Date(user.exp * 1000)
        await am.InsertAuthtokenBlacklist({ token: token, expires_at: exp })

        const st = Date.now()
        const uatoia = await am.UpdateAuthtokenIsActive(token)
        const et = Date.now() - st

        const sl = setLog(req, fuui.fullname, et, uatoia)
        await am.InsertLog(sl)

        return msg(res, 200, { message: 'Logout successfully!' })
    } catch (err) {
        console.log('Logout : ', err)
        return msg(res, 500, { message: err.message })
    }
}