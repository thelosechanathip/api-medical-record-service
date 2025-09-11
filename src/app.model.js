const pm = require('./libs/prisma')

// Table auth_token_blacklist
exports.FetchAllTokenBlacklist = async () => {
    return await pm.auth_token_blacklist.findMany({
        select: {
            auth_token_blacklist_id: true,
            token: true,
            expires_at: true
        }
    })
}
exports.RemoveTokenBlacklist = async (token) => await pm.auth_token_blacklist.delete({ where: { token: token } })

// Table auth_tokens
exports.FetchAllAuthtoken = async () => {
    return await pm.auth_tokens.findMany({
        select: {
            auth_token_id: true,
            token: true,
            expires_at: true
        }
    })
}
exports.RemoveAuthtoken = async (token) => await pm.auth_tokens.delete({ where: { token: token } })