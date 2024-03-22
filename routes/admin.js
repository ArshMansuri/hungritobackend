const express = require("express")
const { makeResPortal, adminLogin, makeAdmin, loadAdmin } = require("../controller/admin")
const { isAdminAuth } = require("../middleware/userAuth")
const router = express.Router()

router.route('/admin/me').get(isAdminAuth, loadAdmin)
router.route('/admin/login').post(adminLogin)
router.route('/admin/signup').post(makeAdmin)

router.route('/admin/create/resportal').post(isAdminAuth, makeResPortal)

module.exports = router