const axios = require("axios")

// Function ส่งข้อมูลไปยังระบบ Telegram
exports.sendTelegramMessage = async (chatId, otpCode, botToken) => {
    // const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

    try {
        await axios.post(telegramApiUrl, {
            chat_id: chatId, // Chat ID ของผู้ใช้
            text: `รหัส OTP สำหรับเข้าสู่ระบบของคุณคือ: ${otpCode} รหัสจะหมดอายุภายใน 5 นาที.`,
        })
        // console.log("Telegram message sent successfully")
    } catch (error) {
        console.error("Error sending Telegram message:", error.message)
        throw new Error(error?.response?.data?.description)
    }
}