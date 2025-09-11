const express = require('express')
const router = express.Router()
const m = require('../../../middleware/auth/auth.controller') // m = middleware
const rstc = require('./review-status.controller') // rstc = review status controller

router.get('/rst', m.CheckTokenUser, rstc.FetchAllReviewStatus)
router.post('/rst', m.CheckTokenUser, rstc.InsertReviewStatus)
router.get('/rst/:rstId', m.CheckTokenUser, rstc.FetchOneReviewStatusById)
router.put('/rst/:rstId', m.CheckTokenUser, rstc.UpdateReviewStatus)
router.delete('/rst/:rstId', m.CheckTokenUser, rstc.RemoveReviewStatus)

module.exports = router