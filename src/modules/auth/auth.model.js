// Import Function ต่างๆเข้ามายัง authModel จาก File ต่างๆ
const pm = require('../../libs/prisma')
const db_b = require('../../libs/db_b')

// ---------- Helpers ----------
const pickFirst = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null)

// Function บันทึกข้อมูลไปยังตาราง auth_logs
exports.InsertLog = async (data) => await pm.auth_logs.create({ data: data })

/*
    Function ดึงข้อมูล
        id, fullname, username, password, person_id
    จากตาราง
        users
    อ้างอิงจาก
        username
    จำนวน 1 record
    ของ Database backoffice
*/
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

/*
    Function ดึงข้อมูล
        chat_id
    จากตาราง
        notify_user
    อ้างอิงจาก
        person_id, service
    ของ Database backoffice
*/
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

/*
    Function ดึงข้อมูล
        token
    จากตาราง
        notify_app
    อ้างอิงจาก
        service
    ของ Database backoffice
*/
exports.FetchBotToken = async () => {
    const [rows] = await db_b.query('SELECT token FROM notify_app WHERE service = "telegram"')
    return pickFirst(rows)
}

// Function บันทึกข้อมูลไปยังตาราง auth_tokens
exports.InsertAuthtoken = async (data) => await pm.auth_tokens.create({ data: data })

/*
    Function ดึงข้อมูล
        status, fullname, email
    จากตาราง
        users
    join
        hrd_person, hrd_prefix
    อ้างอิงจาก
        id
    ของ Database backoffice
*/
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

// Function อัพเดทข้อมูล otp_varified ไปยังตาราง auth_tokens อ้างอิงจาก token
exports.UpdateAuthtokenOtp = async (token) => await pm.auth_tokens.update({ where: { token: token }, data: { otp_verified: true } })

// Function บันทึกข้อมูลไปยังตาราง auth_token_blacklist
exports.InsertAuthtokenBlacklist = async (data) => await pm.auth_token_blacklist.create({ data: data })

// Function อัพเดทข้อมูล is_active ไปยังตาราง auth_tokens อ้างอิงจาก token
exports.UpdateAuthtokenIsActive = async (token) => await pm.auth_tokens.update({ where: { token: token }, data: { is_active: false } })