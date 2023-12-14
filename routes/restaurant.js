const express = require('express')
const { resFirstSignUp, resEmailVerify, resPrimarySignUp, resPhoneMakeOtp, resPhoneVerify, resOwnerPhoneMakeOtp, resOwnerPhoneVerify, resSecondaySignUp, resLastSignUp, resLogin } = require('../controller/restaurant')
const { isRestuAuth } = require('../middleware/userAuth')
const router = express.Router()

router.route('/restaurant/fisrt/signup').post(resFirstSignUp)
router.route('/restaurant/restuemail/verify').post(isRestuAuth, resEmailVerify)


router.route('/restaurant/resphone/verify').get(isRestuAuth, resPhoneMakeOtp).post(isRestuAuth, resPhoneVerify)
router.route('/restaurant/resownerphone/verify').get(isRestuAuth, resOwnerPhoneMakeOtp).post(isRestuAuth, resOwnerPhoneVerify)


router.route('/restaurant/primary/signup').post(isRestuAuth, resPrimarySignUp)
router.route('/restaurant/secondary/signup').post(isRestuAuth, resSecondaySignUp)
router.route('/restaurant/last/signup').post(isRestuAuth, resLastSignUp)
router.route('/restaurant/login').post(isRestuAuth, resLogin)

module.exports = router
