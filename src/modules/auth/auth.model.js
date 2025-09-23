const pm = require('../../libs/prisma')
const db_b = require('../../libs/db_b')

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

// Record work data(บันทึกข้อมูลการทำงาน)
exports.InsertLog = async (data) => await pm.auth_logs.create({ data: data })

exports.FetchUser = async (username) => {
    const [rows] = await db_b.query(
        `
            SELECT
                u.id,
                u.name  AS fullname,
                u.username,
                u.password,
                u.PERSON_ID  AS person_id
            FROM users AS u
            WHERE u.username = ?
            LIMIT 1
        `,
        [username]
    )
    return pickFirst(rows)
}

exports.FetchTelegramByPersonId = async (personId) => {
    const [rows] = await db_b.query(
        `
            SELECT
                nu.chat_id
            FROM notify_user AS nu
            WHERE
                nu.service = 'telegram'
                AND nu.person_id = ?
        `, [personId]
    )
    return pickFirst(rows)
}

exports.FetchBotToken = async () => {
    const [rows] = await db_b.query('SELECT token FROM notify_app WHERE service = "telegram"')
    return pickFirst(rows)
}

exports.InsertAuthtoken = async (data) => await pm.auth_tokens.create({ data: data })

exports.FetchUserByUserId = async (userId) => {
    const [rows] = await db_b.query(
        `
            SELECT
                u.status,
                CONCAT(hpf.HR_PREFIX_NAME, u.NAME) AS fullname,
                u.email
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

exports.UpdateAuthtokenOtp = async (token) => await pm.auth_tokens.update({ where: { token: token }, data: { otp_verified: true } })

exports.InsertAuthtokenBlacklist = async (data) => await pm.auth_token_blacklist.create({ data: data })

exports.UpdateAuthtokenIsActive = async (token) => await pm.auth_tokens.update({ where: { token: token }, data: { is_active: false } })