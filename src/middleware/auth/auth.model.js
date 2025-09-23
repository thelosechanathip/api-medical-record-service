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
        `
            SELECT
                u.STATUS,
                CONCAT(hpf.HR_PREFIX_NAME, u.NAME) AS fullname
            FROM
                users AS u
                LEFT OUTER JOIN hrd_person hps ON u.PERSON_ID = hps.ID
                LEFT OUTER JOIN hrd_prefix hpf ON hps.HR_PREFIX_ID = hpf.HR_PREFIX_ID
            WHERE
                u.id = ?
        `, [userId]
    )
    return pickFirst(rows)
}