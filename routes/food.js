const express = require("express")
const { isRestuAuth } = require("../middleware/userAuth")
const { createFoodCart, updateFoodCart, deleteFoodCart } = require("../controller/food")
const router = express.Router()

router.route('/restaurant/food/create').post(isRestuAuth, createFoodCart)
router.route('/restaurant/food/update/:id').put(isRestuAuth, updateFoodCart)
router.route('/restaurant/food/delete/:id').delete(isRestuAuth, deleteFoodCart)

module.exports = router
