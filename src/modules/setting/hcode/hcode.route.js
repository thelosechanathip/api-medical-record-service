const express = require('express')
const router = express.Router()
const m = require('../../../middleware/auth/auth.controller') // m = middleware
const hcc = require("./hcode.controller")

router.get('/hcode', hcc.FetchAllHcodes)
router.post('/hcode', hcc.UpsertHcode)
router.get('/hcode/:hcodeId', m.CheckTokenUser, hcc.FetchOneHcodeById)
router.delete('/hcode/:hcodeId', m.CheckTokenUser, hcc.RemoveHcode)

module.exports = router