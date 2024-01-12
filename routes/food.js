const express = require("express")
const { isRestuAuth } = require("../middleware/userAuth")
const { createFoodCart, updateFoodCart, deleteFoodCart, getResFoodList } = require("../controller/food")
const router = express.Router()

router.route('/restaurant/food/create').post(isRestuAuth, createFoodCart)
router.route('/restaurant/food/update/:id').put(isRestuAuth, updateFoodCart)
router.route('/restaurant/food/delete/:id').delete(isRestuAuth, deleteFoodCart)

router.route('/restaurant/food/list').get(isRestuAuth, getResFoodList)

module.exports = router
