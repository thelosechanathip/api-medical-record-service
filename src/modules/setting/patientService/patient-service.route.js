const express = require('express')
const router = express.Router()

router.get('/pts', () => console.log("Fetching all patients..."))

module.exports = router