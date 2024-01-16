const express = require("express")
const { isRestuAuth } = require("../middleware/userAuth")
const { createFoodCart, updateFoodCart, deleteFoodCart, getResFoodList, getResSingleFoodList, updateFoodCartIsAvailable } = require("../controller/food")
const router = express.Router()

router.route('/restaurant/food/create').post(isRestuAuth, createFoodCart)
router.route('/restaurant/food/update/isAvalilable/:foodId').put(isRestuAuth, updateFoodCartIsAvailable)
router.route('/restaurant/food/update/:foodId').put(isRestuAuth, updateFoodCart)
router.route('/restaurant/food/delete/:id').delete(isRestuAuth, deleteFoodCart)

router.route('/restaurant/food/list').get(isRestuAuth, getResFoodList)
router.route('/restaurant/food/:foodId').get(isRestuAuth, getResSingleFoodList)

module.exports = router
