const express = require('express')
const router = express.Router()
const m = require('../../../middleware/auth/auth.controller') // m = middleware
const hcc = require("./hcode.controller")

router.get('/hcode', m.CheckTokenUser, hcc.FetchAllHcodes)

module.exports = router