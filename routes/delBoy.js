const express = require('express')
const { dbFirstSignUp, dbEmailVerify, dbPhoneMakeOtp, dbPhoneVerify, dbPrimarySignUp, loadDb, dbLastSignUp, dbLogin, getDbNewOrders, dbUpdateLiveLocation, dbAcceptOrder, dbMyActiveOrder, dbUpdateResStatus, dbActiveDeactive, dbDeliverdOrder, dbDashCharts, dbLogout } = require('../controller/delBoy')
const { isDbAuth } = require('../middleware/userAuth')
const router = express.Router()

router.route('/delboy/me').get(isDbAuth, loadDb)
router.route('/delboy/login').post(dbLogin)
router.route('/delboy/logout').get(isDbAuth, dbLogout)
router.route('/delboy/fisrt/signup').post(dbFirstSignUp)
router.route('/delboy/dbemail/verify').post(isDbAuth, dbEmailVerify)

router.route('/delboy/dbphone/makeotp').post(isDbAuth, dbPhoneMakeOtp)
router.route('/delboy/dbphone/verify').post(isDbAuth, dbPhoneVerify)

router.route('/delBoy/primary/signup').post(isDbAuth, dbPrimarySignUp)
router.route('/delBoy/last/signup').post(isDbAuth, dbLastSignUp)

router.route('/delBoy/active/deactive').get(isDbAuth, dbActiveDeactive)
router.route('/delBoy/update/location').post(isDbAuth, dbUpdateLiveLocation)

router.route('/delBoy/neworders').get(isDbAuth, getDbNewOrders)
router.route('/delBoy/accept/:ordId').get(isDbAuth, dbAcceptOrder)
router.route('/delBoy/active/order').get(isDbAuth, dbMyActiveOrder)
router.route('/delBoy/active/order/update/res/status').post(isDbAuth, dbUpdateResStatus)
router.route('/delBoy/active/order/delivered/:ordId').get(isDbAuth, dbDeliverdOrder)

router.route('/delBoy/deshboard/charts').get(isDbAuth, dbDashCharts)


module.exports = router