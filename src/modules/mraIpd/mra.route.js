const express = require('express')
const router = express.Router()
const m = require('../../middleware/auth/auth.controller') // m = middleware
const mraC = require('./mra.controller') // mraC = mra controller

router.get('/mraIpd', m.CheckTokenUser, mraC.FetchAllMedicalRecordAuditIPD)
router.get('/mraIpd/:patient_an', m.CheckTokenUser, mraC.FetchOneMedicalRecordAuditIPDByAn)
router.get('/mraIpd/fetchPatient/:patient_an', m.CheckTokenUser, mraC.FetchOnePatientData)
router.post('/mraIpd', m.CheckTokenUser, mraC.GenerateForm)
router.put('/mraIpd/:patient_an', m.CheckTokenUser, mraC.UpdateForm)
router.delete('/mraIpd/:patient_an', m.CheckTokenUser, mraC.RemoveData)

module.exports = router