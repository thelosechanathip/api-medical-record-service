const { msg } = require('../../utils/message')
const { Verify } = require('../../services/jsonwebtoken')
const am = require('./auth.model')

/* 
    นิยามตัวย่อ:
        am = auth model
        cblt = check black list token
        cat = check auth token
*/

exports.CheckToken = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return msg(res, 400, { message: 'การเข้าถึงถูกปฏิเสธ!' })

    const token = authHeader.split(' ')[1]
    try {
        const decoded = Verify(token)
        if (!decoded) return msg(res, 401, { message: 'Token ไม่ถูกต้อง!' })

        const cblt = await am.CheckBlackListToken(token)
        if (cblt) return msg(res, 401, { message: 'Tokenไม่อนุญาติให้ใช้งาน!' })

        const cat = await am.CheckAuthToken(token)
        if (!cat) return msg(res, 401, { message: 'Tokenไม่อนุญาติให้ใช้งาน!' })

        req.user = decoded

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