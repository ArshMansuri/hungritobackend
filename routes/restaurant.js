const express = require('express')
const { resFirstSignUp, resEmailVerify, resPrimarySignUp, resPhoneMakeOtp, resPhoneVerify, resOwnerPhoneMakeOtp, resOwnerPhoneVerify, resSecondaySignUp, resLastSignUp, resLogin, loadRes, getResType, getCategories, getResNewOrder, resAcceptOrder, resDashCharts, resCancelOrder, getResOrderList, resLogout, resForgotPasswordToken, resResetPassLinkVerify, resResetPassByLink } = require('../controller/restaurant')
const { isRestuAuth } = require('../middleware/userAuth')
const router = express.Router()

router.route('/restaurant/me').get(isRestuAuth, loadRes)
router.route('/restaurant/login').post(resLogin)
router.route('/restaurant/logout').get(isRestuAuth, resLogout)
router.route('/restaurant/fisrt/signup').post(resFirstSignUp)
router.route('/restaurant/restuemail/verify').post(isRestuAuth, resEmailVerify)

router.route('/restaurant/forgot/pass/token').post(resForgotPasswordToken)
router.route('/restaurant/reset/pass/link/verify').post(resResetPassLinkVerify)
router.route('/restaurant/reset/pass/bylink').post(resResetPassByLink)


router.route('/restaurant/resphone/makeotp').post(isRestuAuth, resPhoneMakeOtp)
router.route('/restaurant/resphone/verify').post(isRestuAuth, resPhoneVerify)
router.route('/restaurant/resownerphone/makeotp').post(isRestuAuth, resOwnerPhoneMakeOtp)
router.route('/restaurant/resownerphone/verify').post(isRestuAuth, resOwnerPhoneVerify)


router.route('/restaurant/primary/signup').post(isRestuAuth, resPrimarySignUp)
router.route('/restaurant/secondary/signup').post(isRestuAuth, resSecondaySignUp)
router.route('/restaurant/last/signup').post(isRestuAuth, resLastSignUp)

router.route('/restaurant/restypes').get(isRestuAuth, getResType)
router.route('/restaurant/categories').get(isRestuAuth, getCategories)

router.route('/restaurant/order/list').get(isRestuAuth, getResOrderList)
router.route('/restaurant/neworders').get(isRestuAuth, getResNewOrder)
router.route('/restaurant/accept/:ordId').get(isRestuAuth, resAcceptOrder)
router.route('/restaurant/reject/:ordId').delete(isRestuAuth, resCancelOrder)

router.route('/restaurant/deshboard/charts').get(isRestuAuth, resDashCharts)

module.exports = router
