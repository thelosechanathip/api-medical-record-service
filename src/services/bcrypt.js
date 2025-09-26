const bcrypt = require('bcryptjs')

// Function ตรวจสอบรหัสผ่านอ้างอิงจาก password ที่ไม่ได้ Hash มาตรวจสอบกับ password hash แล้วที่อยู่บน Database
exports.ComparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}