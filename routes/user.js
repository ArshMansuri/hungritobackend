const express = require('express')
const { userLogin, userSignUp, userOtpVerify, loadUser } = require('../controller/user')
const { isUserAuth } = require('../middleware/userAuth.js')
const router = express.Router()

router.route('/user/signUp').post(userSignUp)
router.route('/user/signUp/verify').post(isUserAuth, userOtpVerify)
router.route('/user/login').post(userLogin)
router.route('/user/me').get(isUserAuth, loadUser)

module.exports = router
