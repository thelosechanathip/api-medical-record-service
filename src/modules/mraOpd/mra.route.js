const express = require('express')
const router = express.Router()
const m = require('../../middleware/auth/auth.controller') // m = middleware
const mraC = require('./mra.controller')

router.get('/mraOpd/fetchClinicalDetail/:cdId', m.CheckTokenUser, mraC.FetchClinicalDetailByCheckStatus)
router.get('/mraOpd/fetchPatient/:patient_vn', m.CheckTokenUser, mraC.FetchOnePatientData)
router.post('/mraOpd', m.CheckTokenUser, mraC.GenerateForm)
router.delete('/mraOpd/:patient_vn', m.CheckTokenUser, mraC.RemoveData)

module.exports = router