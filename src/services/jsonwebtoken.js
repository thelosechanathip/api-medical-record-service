const jwt = require("jsonwebtoken")

exports.Sign = async (userId, chatId) => {
    return await jwt.sign(
        {
            userId,
            chatId,
            expiresIn: process.env.TOKEN_EXPIRED
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.TOKEN_EXPIRED
        }
    )
}

exports.Verify = async (token) => {
    return await jwt.verify(token, process.env.SECRET_KEY)
}