const express = require('express')
const router = express.Router()
const ac = require('./auth.controller')

/*
    นิยามตัวย่อ:
        ac = auth controller
*/

router.post('/login', ac.AuthLogin)
router.post('/verifyOtp', ac.VerifyOtp)

module.exports = router