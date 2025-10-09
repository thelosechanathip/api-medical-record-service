// Module Application
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const responseTime = require("response-time")
const pino = require("pino")
const schedule = require("node-schedule")
const am = require('./app.model')
const moment = require('moment')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
dotenvExpand.expand(dotenv.config())

// All Routes
// Dashboard
const dashboard = require('./modules/dashboard/dashboard.route')

// Auth
const auth = require('./modules/auth/auth.route')

// Setting
const spts = require('./modules/setting/patientService/patient-service.route')
const srst = require('./modules/setting/reviewStatus/review-status.route')
const scomr = require('./modules/setting/contentOfMedicalRecord/content-of-medical-record.route')
const sof = require('./modules/setting/overallFinding/overall-finding.route')
const hc = require('./modules/setting/hcode/hcode.route')
const cdR = require('./modules/setting/clinicalDetail/clinical-detail.route')

// MRA
const mraIpd = require('./modules/mraIpd/mra.route')
const mraOpdEr = require('./modules/mraOpdEr/mra.route')

// Services
const { msg } = require('./services/message.service')

// ===== App =====
const app = express()

// .env Settings
const BASE_PATH = (process.env.BASE_PATH || 'api').replace(/^\/+|\/+$/g, '') // กันเคสมี/ซ้ำ

// --- Fast & Safe Defaults ---
app.disable('x-powered-by')            // ลดข้อมูลแฉ framework
app.set('trust proxy', 1)              // ใช้ถ้าอยู่หลัง Nginx/HAProxy

// Security headers (เบา, ค่ามาตรฐาน)
app.use(helmet())
// app.use(helmet({ contentSecurityPolicy: false }))

// Response-Time header (ดู latency เร็ว ๆ)
app.use(responseTime())

// CORS แบบระบุให้ชัด (อย่าเปิด * ถ้าไม่จำเป็น)
const allowlist = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({
    origin: allowlist.length ? allowlist : true, // dev = true, prod = allowlist
    credentials: true
}))

// Body parsers — GLOBAL ให้เล็กสุด
// อย่าแบก 50MB ทุก request ถ้าไม่ได้อัปโหลดไฟล์ทุกราย
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb', extended: true }))

// Health & Ready endpoints (ให้ LB เช็คเร็ว)
app.get('/health', (_req, res) => res.status(200).send('ok'))
app.get('/ready', (_req, res) => res.status(200).send('ready'))

// ===== Routes =====
// TIP: ถ้ามี endpoint ที่ต้องรับ body ใหญ่ ๆ (เช่น import/อัปโหลด)
// ให้ใส่ parser ระดับ route เท่านั้น เช่น:
//   router.post('/upload', express.json({ limit: '50mb' }), handler)

app.use(`/${BASE_PATH}/auth`, auth)
app.use(`/${BASE_PATH}/setting`, hc)
app.use(`/${BASE_PATH}/setting`, spts)
app.use(`/${BASE_PATH}/setting`, srst)
app.use(`/${BASE_PATH}/setting`, scomr)
app.use(`/${BASE_PATH}/setting`, sof)
app.use(`/${BASE_PATH}/setting`, cdR)
app.use(`/${BASE_PATH}`, dashboard)
app.use(`/${BASE_PATH}`, mraIpd)
app.use(`/${BASE_PATH}`, mraOpdEr)

// 404 NOT FOUND — ตอบให้ไว
app.use((_, res) => msg(res, 404, { message: "404 NOT FOUND" }))

// Error handler กลาง (มี 4 args)
app.use((err, req, res, _next) => {
    req.log?.error({ err }, 'unhandled_error')
    // ปิดรายละเอียดภายใน ไม่รั่ว stack ใน prod
    return msg(res, 500, { message: 'Internal Server Error' })
})

StartBlacklistScheduler()

// Function Check Scheduler
function StartBlacklistScheduler() {
    // เรียกครั้งแรก
    CheckBlacklistTokenExpired()
    CheckAuthTokenExpired()

    schedule.scheduleJob('0 * * * *', async () => {
        await CheckBlacklistTokenExpired()
        await CheckAuthTokenExpired()
    })
}

// Function check table auth_token_blacklist
async function CheckBlacklistTokenExpired() {
    try {
        const fatb = await am.FetchAllTokenBlacklist()
        if (fatb.length === 0) return

        for (const i of fatb) {
            const exp = moment(i.expires_at).format('YYYY-MM-DD HH:mm:ss')
            const dateNow = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

            if (dateNow >= exp) await am.RemoveTokenBlacklist(i.token)
        }
    } catch (error) {
        console.error("Error CheckBlacklistTokenExpired: ", error.message)
        process.exit(1)
    }
}

// Function check table auth_token
async function CheckAuthTokenExpired() {
    try {
        const faat = await am.FetchAllAuthtoken()
        if (faat.length === 0) return

        for (const i of faat) {
            const exp = moment(i.expires_at).format('YYYY-MM-DD HH:mm:ss')
            const dateNow = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

            if (dateNow >= exp) await am.RemoveAuthtoken(i.token)
        }
    } catch (error) {
        console.error("Error CheckAuthTokenExpired: ", error.message)
        process.exit(1)
    }
}

module.exports = app
