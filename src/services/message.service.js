exports.msg = (res, statusCode, payload) => {
    res.status(statusCode).json(payload)
}