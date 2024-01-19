const express = require('express')
const { userLogin, userSignUp, userOtpVerify, loadUser, getNearestRes, getResFood } = require('../controller/user')
const { isUserAuth } = require('../middleware/userAuth.js')
const router = express.Router()

router.route('/user/signUp').post(userSignUp)
router.route('/user/signUp/verify').post(userOtpVerify)
router.route('/user/login').post(userLogin)
router.route('/user/me').get(isUserAuth, loadUser)

router.route('/user/nearestrestu').post(getNearestRes)
router.route('/user/rest/foods/:resId').get(getResFood)

module.exports = router
