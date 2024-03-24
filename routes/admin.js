const express = require("express")
const { makeResPortal, adminLogin, makeAdmin, loadAdmin, getAllResList, resActiveInActive, getAllDbList, dbBannedUnBanned, getAllNewResList, getDetailNewRes, adminAcceptRes, adminRejectRes, getAllNewDbList, getDetailNewdb, adminRejectDb, adminAcceptDb, adminSendDbEarnMoney, adminReceiveResMoney, adminSendResEarnMoney, adminReceiveDbMoney } = require("../controller/admin")
const { isAdminAuth } = require("../middleware/userAuth")
const router = express.Router()

router.route('/admin/me').get(isAdminAuth, loadAdmin)
router.route('/admin/login').post(adminLogin)
router.route('/admin/signup').post(makeAdmin)

router.route('/admin/create/resportal').post(isAdminAuth, makeResPortal)


router.route('/admin/restu/list').get(isAdminAuth, getAllResList)
router.route('/admin/db/list').get(isAdminAuth, getAllDbList)
router.route('/admin/res/active/inactive/:resId').get(isAdminAuth, resActiveInActive)
router.route('/admin/db/banned/unbanned/:dbId').get(isAdminAuth, dbBannedUnBanned)

router.route('/admin/new/restu/list').get(isAdminAuth, getAllNewResList)
router.route('/admin/new/restu/detail/:resId').get(isAdminAuth, getDetailNewRes)
router.route('/admin/new/restu/accept/:resId').get(isAdminAuth, adminAcceptRes)
router.route('/admin/new/restu/reject/:resId').delete(isAdminAuth, adminRejectRes)


router.route('/admin/new/db/list').get(isAdminAuth, getAllNewDbList)
router.route('/admin/new/db/detail/:dbId').get(isAdminAuth, getDetailNewdb)
router.route('/admin/new/db/accept/:dbId').get(isAdminAuth, adminAcceptDb)
router.route('/admin/new/db/reject/:dbId').delete(isAdminAuth, adminRejectDb)

router.route('/admin/send/res/earn/money/:resId').post(isAdminAuth, adminSendResEarnMoney)
router.route('/admin/receive/res/money/:resId').post(isAdminAuth, adminReceiveResMoney)
router.route('/admin/send/db/earn/money/:dbId').post(isAdminAuth, adminSendDbEarnMoney)
router.route('/admin/receive/db/money/:dbId').post(isAdminAuth, adminReceiveDbMoney)


module.exports = router