const express = require('express')
const router = express.Router()
const m = require('../../middleware/auth/auth.controller') // m = middleware
const mraC = require('./mra.controller')

router.get('/mraOpdEr/fetchClinicalDetail/:cdId', m.CheckTokenUser, mraC.FetchClinicalDetailByCheckStatus)
router.get('/mraOpdEr/fetchPatient/:patient_vn', m.CheckTokenUser, mraC.FetchOnePatientData)
router.post('/mraOpdEr', m.CheckTokenUser, mraC.GenerateForm)
router.delete('/mraOpdEr/:patient_vn', m.CheckTokenUser, mraC.RemoveData)

module.exports = router