const express = require('express')
const router = express.Router()
const m = require('../../../middleware/auth/auth.controller') // m = middleware
const ofc = require('./overall-finding.controller') // ofc = overall finding controller

router.get('/of', m.CheckTokenUser, ofc.FetchAllOverallFinding)
router.post('/of', m.CheckTokenUser, ofc.InsertOverallFinding)
router.get('/of/:ofId', m.CheckTokenUser, ofc.FetchOneOverallFindingById)
router.put('/of/:ofId', m.CheckTokenUser, ofc.UpdateOverallFinding)
router.delete('/of/:ofId', m.CheckTokenUser, ofc.RemoveOverallFinding)

module.exports = router