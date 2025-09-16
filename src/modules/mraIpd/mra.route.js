const express = require('express')
const router = express.Router()
const m = require('../../middleware/auth/auth.controller') // m = middleware
const mraC = require('./mra.controller') // mraC = mra controller

router.post('/mraR', m.CheckTokenUser, mraC.generateForm)

module.exports = router