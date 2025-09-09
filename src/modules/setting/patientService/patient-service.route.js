const express = require('express')
const router = express.Router()
const psc = require('./patient-service.controller')

/* 
    นิยามตัวย่อ:
        psc = patient service controller
*/

router.get('/pts', psc.fetchAllPatientServices)
router.post('/pts', psc.createPatientService)

module.exports = router