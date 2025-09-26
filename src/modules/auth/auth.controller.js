// Import Function ต่างๆเข้ามายัง authController จาก File ต่างๆ
const { msg } = require("../../services/message.service")
const { setLog } = require("../../services/setLog.service")
const { generateOtp, getOtp } = require("../../services/generateOtp")
const { ComparePassword } = require("../../services/bcrypt")
const { Sign, Verify } = require("../../services/jsonwebtoken")
const { sendTelegramMessage } = require("../../services/telegram")
const am = require("./auth.model")

// Function การจัดการระบบ Login
exports.AuthLogin = async (req, res) => {
    try {
        // ดึงข้อมูลจาก body มาเก็บไว้ในตัวแปร data
        const data = req.body

        /*
            ดึงข้อมูล
                id, fullname, username, password, person_id
            จากตาราง
                users
            อ้างอิงจาก
                username
            จำนวน 1 record
            ของ Database backoffice
        */
        const fur = await am.FetchUser(data.username)
        // ถ้าไม่พบข้อมูลจาก fur จะส่ง Response กลับไปยัง Client
        if (!fur) return msg(res, 404, { message: "User not found!" })

        // ตรวจสอบรหัสผ่านอ้างอิงจาก password ที่ไม่ได้ Hash มาตรวจสอบกับ password hash แล้วที่อยู่บน Database
        const cp = await ComparePassword(data.password, fur.password)
        // ถ้าไม่พบข้อมูลจาก fur จะส่ง Response กลับไปยัง Client
        if (!cp) return msg(res, 400, { message: "Password incorrect!" })

        /*
            ดึงข้อมูล
                chat_id
            จากตาราง
                notify_user
            อ้างอิงจาก
                person_id, service
            ของ Database backoffice
        */
        const ftr = await am.FetchTelegramByPersonId(fur.person_id)
        // ถ้าไม่พบข้อมูลจาก ftr จะส่ง Response กลับไปยัง Client
        if (!ftr) return msg(res, 404, { message: "Telegram not found!" })

        // Generate Token ด้วยข้อมูล id และ chat_id
        const token = await Sign(fur.id, ftr.chat_id)

        /*
            ดึงข้อมูล
                token
            จากตาราง
                notify_app
            อ้างอิงจาก
                service
            ของ Database backoffice
        */
        const botToken = await am.FetchBotToken()

        // Generate เลข OTP 6 หลัก
        const otpCode = await generateOtp(ftr.chat_id)

        // ส่งข้อมูลไปยังระบบ Telegram ด้วย chat_id, otpCode, token
        await sendTelegramMessage(ftr.chat_id, otpCode, botToken.token)

        if (token) {
            // Verify Token
            const dataToken = await Verify(token)

            // คูณ 1000 เพราะ timestamp เป็นวินาที แต่ Date ใช้มิลลิวินาที
            const exp = new Date(dataToken.exp * 1000)

            const startTime = Date.now()
            // บันทึกข้อมูลไปยังตาราง auth_tokens
            const iat = await am.InsertAuthtoken({ token: token, user_id: fur.id, expires_at: exp })
            const endTime = Date.now() - startTime

            //  Set ข้อมูล Log การทำงานของระบบก่อนที่จะบันทึกไปยัง Database
            const sl = setLog(req, fur.fullname, endTime, iat)

            // บันทึกข้อมูลไปยังตาราง auth_logs
            await am.InsertLog(sl)

            // ถ้ามีข้อมูลจาก iat จะส่ง Response กลับไปยัง Client
            if (iat) return msg(res, 200, { token: token })
        }
    } catch (err) {
        console.log('AuthLogin : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function การจัดการระบบ Verify OTP
exports.VerifyOtp = async (req, res) => {
    // ดึงข้อมูลจาก authorization จาก headers มาเก็บไว้ในตัวแปร authHeader
    const authHeader = req.headers.authorization
    // ถ้าไม่พบข้อมูลจาก authHeader จะส่ง Response กลับไปยัง Client
    if (!authHeader) return msg(res, 401, { message: 'ไม่มี Token ถูกส่งมา' })

    // ดึงข้อมูล token ที่อยู่รวมกับและตัดคำออกจาก Bearer เอาแต่คำข้างหลังจะได้ token มาเก็บไว้ในตัวแปร token
    const token = authHeader.split(' ')[1]

    try {
        // Verify Token
        const decoded = await Verify(token)
        // ถ้าไม่พบข้อมูลจาก decoded จะส่ง Response กลับไปยัง Client
        if (!decoded) return msg(res, 401, { message: 'Token ไม่ถูกต้อง' })

        // ดึงข้อมูล otpCode จาก body
        const { otpCode } = req.body
        // ดึงข้อมูล chatId จาก decoded มาเก็บไว้ในตัวแปร chatId
        const chatId = decoded.chatId
        // ถ้าไม่พบข้อมูลจาก chatId จะส่ง Response กลับไปยัง Client
        if (!chatId) return msg(res, 401, { message: 'ไม่พบ chatId' })

        // ดึงข้อมูล OTP จาก Cache
        const cacheOtp = await getOtp(chatId)
        // ถ้าไม่พบข้อมูลจาก cacheOtp จะส่ง Response กลับไปยัง Client
        if (!cacheOtp) return msg(res, 400, { message: "OTP หมดอายุหรือไม่ถูกต้อง" })

        // ถ้า otpCode ตรงกับ cacheOtp
        if (cacheOtp === otpCode) {
            /*
                ดึงข้อมูล
                    status, fullname, email
                จากตาราง
                    users
                join
                    hrd_person, hrd_prefix
                อ้างอิงจาก
                    id
                ของ Database backoffice
            */
            const fuui = await am.FetchUserByUserId(decoded.userId)

            const startTime = Date.now()

            // Function อัพเดทข้อมูล otp_varified ไปยังตาราง auth_tokens อ้างอิงจาก token
            const uato = await am.UpdateAuthtokenOtp(token)
            const endTime = Date.now() - startTime

            // Set ข้อมูล Log การทำงานของระบบก่อนที่จะบันทึกไปยัง Database
            const sl = setLog(req, fuui.fullname, endTime, uato)

            // บันทึกข้อมูลไปยังตาราง auth_logs
            await am.InsertLog(sl)

            // ส่ง Response กลับไปยัง Client
            return msg(res, 200, { message: "Login successfully!" })
            // ถ้า otpCode ไม่ตรงกับ cacheOtp
        } else {
            // ส่ง Response กลับไปยัง Client
            return msg(res, 400, { message: "OTP ไม่ถูกต้อง" });
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') return msg(res, 401, { message: 'TokenExpiredError!' })
        else if (err.name === 'JsonWebTokenError') return msg(res, 401, { message: 'JsonWebTokenError!' })

        console.error('Error verifyToken :', err)
        return msg(res, 500, { message: 'Internal Server Error!' })
    }
}

// Function การจัดการระบบ Verify
exports.Verify = async (req, res) => {
    // ดึงข้อมูล userId จาก user มาเก็บไว้ในตัวแปร userId
    const userId = req.user.userId
    try {
        const startTime = Date.now()
        /*
            ดึงข้อมูล
                status, fullname, email
            จากตาราง
                users
            join
                hrd_person, hrd_prefix
            อ้างอิงจาก
                id
            ของ Database backoffice
        */
        const fuui = await am.FetchUserByUserId(userId)
        const endTime = Date.now() - startTime

        // Set ข้อมูล Log การทำงานของระบบก่อนที่จะบันทึกไปยัง Database
        const sl = setLog(req, fuui.fullname, endTime, fuui)

        // บันทึกข้อมูลไปยังตาราง auth_logs
        await am.InsertLog(sl)

        // ส่ง Response กลับไปยัง Client
        return msg(res, 200, { data: fuui })
    } catch (err) {
        console.log('Verify : ', err)
        return msg(res, 500, { message: err.message })
    }
}

// Function การจัดการระบบ Logout
exports.Logout = async (req, res) => {
    // ดึงข้อมูล user มาเก็บไว้ในตัวแปร user
    const user = req.user
    // ดึงข้อมูล token มาเก็บไว้ในตัวแปร token
    const token = req.token
    try {
        /*
            ดึงข้อมูล
                status, fullname, email
            จากตาราง
                users
            join
                hrd_person, hrd_prefix
            อ้างอิงจาก
                id
            ของ Database backoffice
        */
        const fuui = await am.FetchUserByUserId(user.userId)

        // คูณ 1000 เพราะ timestamp เป็นวินาที แต่ Date ใช้มิลลิวินาที
        const exp = new Date(user.exp * 1000)

        // บันทึกข้อมูลไปยังตาราง auth_token_blacklist
        await am.InsertAuthtokenBlacklist({ token: token, expires_at: exp })

        const startTime = Date.now()

        // อัพเดทข้อมูล is_active ไปยังตาราง auth_tokens อ้างอิงจาก token
        const uatoia = await am.UpdateAuthtokenIsActive(token)
        const endTime = Date.now() - startTime

        // Set ข้อมูล Log การทำงานของระบบก่อนที่จะบันทึกไปยัง Database
        const sl = setLog(req, fuui.fullname, endTime, uatoia)

        // บันทึกข้อมูลไปยังตาราง auth_logs
        await am.InsertLog(sl)

        // ส่ง Response กลับไปยัง Client
        return msg(res, 200, { message: 'Logout successfully!' })
    } catch (err) {
        console.log('Logout : ', err)
        return msg(res, 500, { message: err.message })
    }
}