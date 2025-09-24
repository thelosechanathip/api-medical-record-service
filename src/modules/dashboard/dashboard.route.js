const express = require('express')
const router = express.Router()
const dbC = require('./dashboard.controller')

router.get('/dashboard', dbC.FetchMraIpdCount)

module.exports = router