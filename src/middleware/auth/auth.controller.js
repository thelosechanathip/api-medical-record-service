// Import Function ต่างๆเข้ามายัง authController จาก File ต่างๆ
const { msg } = require('../../services/message.service')
const { Verify } = require('../../services/jsonwebtoken')
const am = require('./auth.model')

// Function การจัดการสิทธิ์ของ ADMIN
exports.CheckTokenAdmin = async (req, res, next) => {
    // ดึงข้อมูลจาก authorization จาก headers มาเก็บไว้ในตัวแปร authHeader
    const authHeader = req.headers.authorization
    // ถ้าไม่พบข้อมูลจาก authHeader จะส่ง Response กลับไปยัง Client
    if (!authHeader) return msg(res, 400, { message: 'การเข้าถึงถูกปฏิเสธ!' })

    // ดึงข้อมูล token ที่อยู่รวมกับและตัดคำออกจาก Bearer เอาแต่คำข้างหลังจะได้ token มาเก็บไว้ในตัวแปร token
    const token = authHeader.split(' ')[1]
    try {
        // Verify Token
        const decoded = await Verify(token)
        // ถ้าไม่พบข้อมูลจาก decoded จะส่ง Response กลับไปยัง Client
        if (!decoded) return msg(res, 401, { message: 'Token ไม่ถูกต้อง!' })

        // ดึงข้อมูล auth_token_blacklist_id 1 record จากตาราง auth_token_blacklist อ้างอิงจาก token
        const cblt = await am.CheckBlackListToken(token)
        // ถ้ามีข้อมูลจาก cblt จะส่ง Response กลับไปยัง Client
        if (cblt) return msg(res, 401, { message: 'Tokenไม่อนุญาติให้ใช้งาน!' })

        // ดึงข้อมูล otp_verified, is_active 1 record จากตาราง auth_tokens อ้างอิงจาก token
        const cat = await am.CheckAuthToken(token)
        // นำข้อมูล false เก็บไว้ในตัวแปร CATError
        let CATError = false
        // ถ้าไม่มีข้อมูลจาก cat นำข้อมูล true เก็บไว้ในตัวแปร CATError
        if (!cat) CATError = true
        // ถ้า otp_verified จาก cat มีค่าเป็น false นำข้อมูล true เก็บไว้ในตัวแปร CATError
        else if (cat.otp_verified === false) CATError = true
        // ถ้า is_active จาก cat มีค่าเป็น false นำข้อมูล true เก็บไว้ในตัวแปร CATError
        else if (cat.is_active === false) CATError = true
        // ถ้า CATError มีค่าเป็น true จะส่ง Response กลับไปยัง Client
        if (CATError === true) return msg(res, 401, { message: 'Tokenไม่อนุญาตให้ใช้งาน!' })

        /*
            ดึงข้อมูล
                status, fullname
            จากตาราง
                users
            join
                hrd_person
                hrd_prefix
            อ้างอิงจาก
                id
            ของ Database backoffice
        */
        const cr = await am.CheckRole(decoded.userId)

        // ถ้า status จาก cr มีค่าไม่เท่ากับ ADMIN จะส่ง Response กลับไปยัง Client
        if (cr.status != 'ADMIN') return msg(res, 401, { message: 'User นี้ไม่อนุญาตให้เข้าถึงข้อมูล' })

        // นำข้อมูล decoded เก็บไว้ในตัวแปร user
        req.user = decoded

        // ถ้าผ่านเงื่อนทั้งหมดถ้าบนก็สามารถผ่านไปยัง route ต่อได้
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return msg(res, 401, { message: 'TokenExpiredError!' })
        } else if (err.name === 'JsonWebTokenError') {
            return msg(res, 401, { message: 'JsonWebTokenError!' })
        }
        console.error('Error verifying token:', err);
        return msg(res, 500, { message: 'Internal Server Error!' })
    }
}

// Function การจัดการสิทธิ์ของ USER
exports.CheckTokenUser = async (req, res, next) => {
    // ดึงข้อมูลจาก authorization จาก headers มาเก็บไว้ในตัวแปร authHeader
    const authHeader = req.headers.authorization
    // ถ้าไม่พบข้อมูลจาก authHeader จะส่ง Response กลับไปยัง Client
    if (!authHeader) return msg(res, 400, { message: 'การเข้าถึงถูกปฏิเสธ!' })

    // ดึงข้อมูล token ที่อยู่รวมกับและตัดคำออกจาก Bearer เอาแต่คำข้างหลังจะได้ token มาเก็บไว้ในตัวแปร token
    const token = authHeader.split(' ')[1]
    try {
        // Verify Token
        const decoded = await Verify(token)
        // ถ้าไม่พบข้อมูลจาก decoded จะส่ง Response กลับไปยัง Client
        if (!decoded) return msg(res, 401, { message: 'Token ไม่ถูกต้อง!' })

        // ดึงข้อมูล auth_token_blacklist_id 1 record จากตาราง auth_token_blacklist อ้างอิงจาก token
        const cblt = await am.CheckBlackListToken(token)
        // ถ้ามีข้อมูลจาก cblt จะส่ง Response กลับไปยัง Client
        if (cblt) return msg(res, 401, { message: 'Tokenไม่อนุญาตให้ใช้งาน!' })

        // ดึงข้อมูล otp_verified, is_active 1 record จากตาราง auth_tokens อ้างอิงจาก token
        const cat = await am.CheckAuthToken(token)
        // นำข้อมูล false เก็บไว้ในตัวแปร CATError
        let CATError = false
        // ถ้าไม่มีข้อมูลจาก cat นำข้อมูล true เก็บไว้ในตัวแปร CATError
        if (!cat) CATError = true
        // ถ้า otp_verified จาก cat มีค่าเป็น false นำข้อมูล true เก็บไว้ในตัวแปร CATError
        else if (cat.otp_verified === false) CATError = true
        // ถ้า is_active จาก cat มีค่าเป็น false นำข้อมูล true เก็บไว้ในตัวแปร CATError
        else if (cat.is_active === false) CATError = true
        // ถ้า CATError มีค่าเป็น true จะส่ง Response กลับไปยัง Client
        if (CATError === true) return msg(res, 401, { message: 'Tokenไม่อนุญาตให้ใช้งาน!' })

        /*
            ดึงข้อมูล
                status, fullname
            จากตาราง
                users
            join
                hrd_person
                hrd_prefix
            อ้างอิงจาก
                id
            ของ Database backoffice
        */
        const cr = await am.CheckRole(decoded.userId)

        // นำข้อมูล decoded เก็บไว้ในตัวแปร user
        req.user = decoded
        // นำข้อมูล fullname จาก cr เก็บไว้ในตัวแปร fullname
        req.fullname = cr.fullname
        // นำข้อมูล tokem เก็บไว้ในตัวแปร token
        req.token = token

        // ถ้าผ่านเงื่อนทั้งหมดถ้าบนก็สามารถผ่านไปยัง route ต่อได้
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return msg(res, 401, { message: 'TokenExpiredError!' })
        } else if (err.name === 'JsonWebTokenError') {
            return msg(res, 401, { message: 'JsonWebTokenError!' })
        }
        console.error('Error verifying token:', err);
        return msg(res, 500, { message: 'Internal Server Error!' })
    }
}