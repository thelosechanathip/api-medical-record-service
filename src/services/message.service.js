// Function สำหรับสร้าง Message ที่เอาไว้ส่ง Response กลับไปยัง Client
exports.msg = (res, statusCode, payload) => {
    res.status(statusCode).json(payload)
}