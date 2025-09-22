const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.hcode_logs.create({ data: data })

exports.FetchAllHcodes = async () => await pm.hcodes.findMany()