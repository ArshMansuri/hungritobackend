const express = require('express')
const { isUserAuth } = require('../middleware/userAuth')
const { createUserPayment } = require('../controller/payment')
const router = express.Router()

router.route('/user/payment/create').post(isUserAuth, createUserPayment)

module.exports = router
