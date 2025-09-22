const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.hcode_logs.create({ data: data })

exports.FetchAllHcodes = async () => await pm.hcodes.findMany()

exports.UpsertHcode = async (hcodeId, hcodeData) => {
    if (hcodeId) return await pm.hcodes.update({ where: { hcode_id: hcodeId }, data: hcodeData })
    else return await pm.hcodes.create({ data: hcodeData })
}

exports.FetchOneHcodeById = async (hcodeId) => await pm.hcodes.findFirst({ where: { hcode_id: hcodeId } })

exports.CheckForeignKey = async () => {
    return await pm.$queryRaw`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'hcodes'
        AND REFERENCED_COLUMN_NAME = 'hcode_id'
        AND EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = KEY_COLUMN_USAGE.TABLE_NAME
        )
    `
}

exports.CheckForeignKeyData = async (tableName, columnName, id) => {
    return await pm.$queryRawUnsafe(`
        SELECT 1 FROM ${tableName} WHERE ${columnName} = "${id}" LIMIT 1
    `)
}

exports.RemoveHcode = async (hcodeId) => await pm.hcodes.delete({ where: { hcode_id: hcodeId } })