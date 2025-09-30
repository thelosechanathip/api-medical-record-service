const express = require('express')
const router = express.Router()
const m = require('../../../middleware/auth/auth.controller') // m = middleware
const hcc = require("./hcode.controller")

router.get('/hcode', hcc.FetchAllHcodes)
router.post('/hcode', m.CheckTokenAdmin, hcc.UpsertHcode)
router.get('/hcode/:hcodeId', m.CheckTokenAdmin, hcc.FetchOneHcodeById)
router.delete('/hcode/:hcodeId', m.CheckTokenAdmin, hcc.RemoveHcode)

module.exports = router