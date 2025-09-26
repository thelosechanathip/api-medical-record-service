// Import Function ต่างๆเข้ามายัง authRoute จาก File ต่างๆ
const express = require('express')
const ac = require('./auth.controller')
const m = require('../../middleware/auth/auth.controller')

// นำ Function Router จาก express มาเก็บไว้ในตัวแปร router
const router = express.Router()

// เมื่อเข้ามาที่ /login(Method: POST) จะเรียกใช้งาน function AuthLogin
router.post('/login', ac.AuthLogin)
// เมื่อเข้ามาที่ /verifyOtp(Method: POST) จะเรียกใช้งาน function VerifyOtp
router.post('/verifyOtp', ac.VerifyOtp)
// เมื่อเข้ามาที่ /verify(Method: POST) จะเรียกใช้งาน function Verify
router.post('/verify', m.CheckTokenUser, ac.Verify)
// เมื่อเข้ามาที่ /logout(Method: POST) จะเรียกใช้งาน function Logout
router.post('/logout', m.CheckTokenUser, ac.Logout)

// ส่งออก router ให้ File อื่นสามารถเรียกใช้งานได้
module.exports = router