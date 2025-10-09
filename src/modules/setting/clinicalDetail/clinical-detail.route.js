const express = require('express')
const router = express.Router()
const m = require('../../../middleware/auth/auth.controller') // m = middleware
const cdC = require('./clinical-detail.controller')

router.get('/clinicalDetails', m.CheckTokenUser, cdC.FetchAllClinicalDetails)
router.post('/clinicalDetails', m.CheckTokenUser, cdC.InsertClinicalDetail)
router.get('/clinicalDetails/:cdId', m.CheckTokenUser, cdC.FetchOneClinicalDetailById)
router.put('/clinicalDetails/:cdId', m.CheckTokenUser, cdC.UpdateClinicalDetail)
router.delete('/clinicalDetails/:cdId', m.CheckTokenUser, cdC.RemoveClinicalDetail)

module.exports = router