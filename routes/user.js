const express = require('express')
const { userLogin, userSignUp, userOtpVerify, loadUser, getNearestRes, getResFood, addToCart, removeFromCart, increaseQutOfCartFood, decreaseQutOfCartFood, getMyCartDetail } = require('../controller/user')
const { isUserAuth } = require('../middleware/userAuth.js')
const router = express.Router()

router.route('/user/signUp').post(userSignUp)
router.route('/user/signUp/verify').post(userOtpVerify)
router.route('/user/login').post(userLogin)
router.route('/user/me').get(isUserAuth, loadUser)

router.route('/user/nearestrestu').post(getNearestRes)
router.route('/user/rest/foods/:resId').get(getResFood)

router.route('/user/my/cart').get(isUserAuth, getMyCartDetail)
router.route('/user/addtocart').post(isUserAuth, addToCart)
router.route('/user/removefromcart').put(isUserAuth, removeFromCart)
router.route('/user/update/cart').put(isUserAuth, increaseQutOfCartFood)
router.route('/user/remove/cart').put(isUserAuth, decreaseQutOfCartFood)

module.exports = router