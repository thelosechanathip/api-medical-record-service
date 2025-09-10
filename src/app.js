// Module Application
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
require("dotenv").config()

// All Paths => Setting
const patientService = require('./modules/setting/patientService/patient-service.route')
const auth = require('./modules/auth/auth.route')

// All Services
const { msg } = require('./services/message.service')

// สร้าง instance ของ Express application
const app = express()

// .env Settings
const BASE_PATH = process.env.BASE_PATH

// Middleware
app.use(morgan("dev"))
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// All Routes => Setting
app.use(`/${BASE_PATH}/setting`, patientService)
app.use(`/${BASE_PATH}/auth`, auth)

// 404 NOT FOUND
app.use((req, res) => { return msg(res, 404, { message: "404 NOT FOUND" }) })

module.exports = app