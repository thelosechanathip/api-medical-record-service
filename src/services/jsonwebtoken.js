const jwt = require("jsonwebtoken")

exports.Sign = (userId, chatId) => {
    return jwt.sign(
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

exports.Verify = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY)
}