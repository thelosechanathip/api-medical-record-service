const pm = require('../../../libs/prisma')

exports.InsertLog = async (data) => await pm.hcodes.create({ data: data })

exports.FetchAllHcodes = async ()