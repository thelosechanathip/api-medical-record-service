const express = require('express')
const router = express.Router()
const m = require('../../middleware/auth/auth.controller') // m = middleware
const mraC = require('./mra.controller') // mraC = mra controller

router.post('/mraR', m.CheckTokenUser, mraC.GenerateForm)
router.put('/mraR/:patient_an', m.CheckTokenUser, mraC.UpdateForm)
router.delete('/mraR/:patient_an', m.CheckTokenUser, mraC.RemoveData)

module.exports = router