const express = require('express')
const router = express.Router()
const m = require('../../../middleware/auth/auth.controller') // m = middleware
const comrc = require('./content-of-medical-record.controller') // comrc = content of medical record controller

router.get('/comrc', m.CheckTokenUser, comrc.FetchAllContentOfMedicalRecords)
router.post('/comrc', m.CheckTokenUser, comrc.InsertContentOfMedicalRecord)
router.get('/comrc/:comrId', m.CheckTokenUser, comrc.FetchOneContentOfMedicalRecordById)
router.put('/comrc/:comrId', m.CheckTokenUser, comrc.UpdateContentOfMedicalRecord)
router.delete('/comrc/:comrId', m.CheckTokenUser, comrc.RemoveContentOfMedicalRecord)

module.exports = router