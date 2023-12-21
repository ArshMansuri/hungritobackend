const express = require('express')
const { resFirstSignUp, resEmailVerify, resPrimarySignUp, resPhoneMakeOtp, resPhoneVerify, resOwnerPhoneMakeOtp, resOwnerPhoneVerify, resSecondaySignUp, resLastSignUp, resLogin, loadRes, getResType, getCategories } = require('../controller/restaurant')
const { isRestuAuth } = require('../middleware/userAuth')
const router = express.Router()

router.route('/restaurant/me').get(isRestuAuth, loadRes)
router.route('/restaurant/fisrt/signup').post(resFirstSignUp)
router.route('/restaurant/restuemail/verify').post(isRestuAuth, resEmailVerify)


router.route('/restaurant/resphone/makeotp').post(isRestuAuth, resPhoneMakeOtp)
router.route('/restaurant/resphone/verify').post(isRestuAuth, resPhoneVerify)
router.route('/restaurant/resownerphone/makeotp').post(isRestuAuth, resOwnerPhoneMakeOtp)
router.route('/restaurant/resownerphone/verify').post(isRestuAuth, resOwnerPhoneVerify)


router.route('/restaurant/primary/signup').post(isRestuAuth, resPrimarySignUp)
router.route('/restaurant/secondary/signup').post(isRestuAuth, resSecondaySignUp)
router.route('/restaurant/last/signup').post(isRestuAuth, resLastSignUp)
router.route('/restaurant/login').post(isRestuAuth, resLogin)

router.route('/restaurant/restypes').get(isRestuAuth, getResType)
router.route('/restaurant/categories').get(isRestuAuth, getCategories)

module.exports = router
