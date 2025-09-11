const pm = require("../../libs/prisma")
const db_b = require("../../libs/db_b")

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

exports.CheckBlackListToken = async (token) => {
    return await pm.auth_token_blacklist.findFirst({ where: { token: token }, select: { auth_token_blacklist_id: true } })
}

exports.CheckAuthToken = async (token) => {
    return await pm.auth_tokens.findFirst({ where: { token: token }, select: { otp_verified: true, is_active: true } })
}

exports.CheckRole = async (userId) => {
    const [rows] = await db_b.query(
        "SELECT status FROM users WHERE id = ?", [userId]
    )
    return pickFirst(rows)
}