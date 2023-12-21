const express = require("express")
const router = express.Router()

router.route('/restaurant/food/create').post(isRestuAuth, createFoodCart)

module.exports = router