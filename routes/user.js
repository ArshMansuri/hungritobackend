const express = require('express')
const { userLogin, userSignUp, userOtpVerify } = require('../controller/user')
const { isUserAuth } = require('../middleware/userAuth.js')
const router = express.Router()

router.route('/user/signUp').post(userSignUp)
router.route('/user/signUp/verify').post(isUserAuth, userOtpVerify)
router.route('/user/login').get(isUserAuth,userLogin)

module.exports = router
