const express = require('express')
const router = express.Router()
const ptsc = require('./patient-service.controller') // ptsc = patient service controller
const m = require('../../../middleware/auth/auth.controller') // m = middleware

// pts = patient service
router.get('/pts', m.CheckTokenUser, ptsc.FetchAllPatientServices)
router.post('/pts', m.CheckTokenUser, ptsc.CreatePatientService)
router.get('/pts/:ptsId', m.CheckTokenUser, ptsc.FetchOnePatientServiceById)
router.put('/pts/:ptsId', m.CheckTokenUser, ptsc.UpdatePatientService)
router.delete('/pts/:ptsId', m.CheckTokenUser, ptsc.RemovePatientService)

module.exports = router