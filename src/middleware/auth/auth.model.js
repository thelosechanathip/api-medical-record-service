// Import Function ต่างๆเข้ามายัง authModel จาก File ต่างๆ
const pm = require("../../libs/prisma")
const db_b = require("../../libs/db_b")

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

// Function ดึงข้อมูล auth_token_blacklist_id 1 record จากตาราง auth_token_blacklist อ้างอิงจาก token
exports.CheckBlackListToken = async (token) => {
    return await pm.auth_token_blacklist.findFirst({ where: { token: token }, select: { auth_token_blacklist_id: true } })
}

// Function ดึงข้อมูล otp_verified, is_active 1 record จากตาราง auth_tokens อ้างอิงจาก token
exports.CheckAuthToken = async (token) => {
    return await pm.auth_tokens.findFirst({ where: { token: token }, select: { otp_verified: true, is_active: true } })
}

/*
    Function ดึงข้อมูล
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
exports.CheckRole = async (userId) => {
    const [rows] = await db_b.query(
        `
            SELECT
                u.STATUS AS status,
                hdpm.HR_DEPARTMENT_NAME AS department,
                CONCAT(hpf.HR_PREFIX_NAME, u.NAME) AS fullname
            FROM
                users AS u
                LEFT OUTER JOIN hrd_person AS hps ON u.PERSON_ID = hps.ID
                LEFT OUTER JOIN hrd_prefix AS hpf ON hps.HR_PREFIX_ID = hpf.HR_PREFIX_ID
                LEFT OUTER JOIN hrd_department AS hdpm ON hps.HR_DEPARTMENT_ID = hdpm.HR_DEPARTMENT_ID
            WHERE
                u.id = ?
        `, [userId]
    )
    return pickFirst(rows)
}