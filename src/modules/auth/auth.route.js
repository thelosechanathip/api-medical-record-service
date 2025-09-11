const express = require('express')
const router = express.Router()
const ac = require('./auth.controller')
const m = require('../../middleware/auth/auth.controller')

/*
    นิยามตัวย่อ:
        ac = auth controller
        m = midleware
*/

router.post('/login', ac.AuthLogin)
router.post('/verifyOtp', ac.VerifyOtp)
router.post('/verify', m.CheckTokenUser, ac.Verify)
router.post('/logout', m.CheckTokenUser, ac.Logout)

module.exports = router