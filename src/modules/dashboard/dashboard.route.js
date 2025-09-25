const express = require('express')
const router = express.Router()
const m = require('../../middleware/auth/auth.controller') // m = middleware
const dbC = require('./dashboard.controller')

router.get('/dashboard', dbC.FetchMraIpdCount)
router.get('/dashboard/:ward', m.CheckTokenUser, dbC.FetchAllAn)

module.exports = router