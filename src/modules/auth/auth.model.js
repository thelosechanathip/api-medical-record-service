const pm = require('../../libs/prisma')
const db_b = require('../../libs/db_b')

// Record work data(บันทึกข้อมูลการทำงาน)
exports.insertLog = async (data) => await pm.auth_logs.create({ data: data })

exports.FetchUser = async (data) => {
    const result = await db_b.query(
        `
            SELECT
                u.id,
                u.name AS fullname,
                u.username,
                u.password,
                u.PERSON_ID AS person_id
            FROM
                users AS u
            WHERE
                u.username = ?
        `, [data]
    )
    return result[0]
}

exports.FetchTelegramByPersonId = async (data) => {
    const result = await db_b.query(
        `
            SELECT
                nu.chat_id
            FROM notify_user AS nu
            WHERE
                nu.service = 'telegram'
                AND nu.person_id = ?
        `, [data]
    )
    return result[0]
}

exports.FetchBotToken = async () => {
    const result = await db_b.query('SELECT token FROM notify_app WHERE service = "telegram"')
    return result[0]
}

exports.InsertAuthtoken = async (data) => await pm.auth_tokens.create({ data: data })

exports.FetchUserByUserId = async (data) => {
    const result = await db_b.query(
        `
            SELECT
                u.id,
                u.name AS fullname,
                u.username,
                u.password,
                u.PERSON_ID AS person_id
            FROM
                users AS u
            WHERE
                u.id = ?
        `, [data]
    )
    return result[0]
}

exports.UpdateAuthtoken = async (data) => await pm.auth_tokens.update({ where: { token: data }, data: { otp_verified: true } })