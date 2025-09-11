const http = require("node:http")
const https = require("node:https")
const app = require("./src/app")

const PORT = process.env.PORT || 3000
if (!PORT) {
    console.error("Please set PORT in .env file")
    process.exit(1)
}

// เปิด keep-alive สำหรับ outbound HTTP/HTTPS (เวลา app ไปเรียก API อื่น)
const agentOpts = { keepAlive: true, maxSockets: 128, maxFreeSockets: 16 }
http.globalAgent = new http.Agent(agentOpts)
https.globalAgent = new https.Agent(agentOpts)

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`)
})

// Graceful shutdown: ปิด connection ให้เรียบร้อยตอน SIGINT/SIGTERM
const shutdown = (sig) => () => {
    console.log(`${sig} received, shutting down...`)
    server.close(() => {
        console.log("HTTP server closed")
        process.exit(0)
    })
    // กันแขวนถ้ามี connection ไม่ยอมปิด
    setTimeout(() => process.exit(1), 10000).unref()
}
process.on("SIGINT", shutdown("SIGINT"))
process.on("SIGTERM", shutdown("SIGTERM"))