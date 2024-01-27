const express = require('express')
const { isUserAuth } = require('../middleware/userAuth')
const { createCodOrder, createOnlineOrder } = require('../controller/order')
const router = express.Router()

router.route('/user/order/create/cod').post(isUserAuth, createCodOrder)
router.route('/user/order/create/online').post(isUserAuth, createOnlineOrder)

module.exports = router
