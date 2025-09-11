const NodeCache = require("node-cache")
const otpCache = new NodeCache({ stdTTL: process.env.OTP_EXPIRED })

exports.generateOtp = async (identifier) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString() // สร้างตัวเลข 6 หลัก
    await otpCache.set(identifier, otp)
    return otp
}

exports.getOtp = async (identifier) => await otpCache.get(identifier)