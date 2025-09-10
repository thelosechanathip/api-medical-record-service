const pm = require("../../libs/prisma")

exports.CheckBlackListToken = async (token) => {
    return await pm.auth_token_blacklist.findFirst({ where: { token: token }, select: { auth_token_blacklist_id: true } })
}

exports.CheckAuthToken = async (token) => {
    return await pm.auth_tokens.findFirst({ where: { token: token }, select: { otp_verified: true, is_active: true } })
}