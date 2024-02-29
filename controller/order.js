const DelBoy = require("../model/DelBoy");
const Order = require("../model/Order");
const Restaurant = require("../model/Restaurant");
const User = require("../model/User");
const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.createCodOrder = async (req, res) => {
  try {
    const { isToken, deliveryCharg, deliveryAddress } = req.body;
    if (
      isToken === undefined ||
      !deliveryCharg ||
      !deliveryAddress ||
      deliveryAddress.lat === undefined ||
      deliveryAddress.lon === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter Your Address",
      });
    }

    const user = await User.findById(req.user._id);
    if (!(user.cart?.restu.length > 0) || user?.cart?.total === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const tempTotal = user.cart.total;
    let tempToken = 0;
    if (isToken) {
      tempToken = user.token;
    }

    const orderObj = {
      userId: req.user._id,
      orders: {
        restu: user.cart.restu,
        mrp: tempTotal,
        discount: 0,
        tax: tempTotal * 0.18,
        deliveryCharg: deliveryCharg,
        token: tempToken,
        total: tempTotal + tempTotal * 0.18 + deliveryCharg - tempToken,
      },
      deliveryAddress: {
        latitude: deliveryAddress.lat,
        longitude: deliveryAddress.lon,
        doorFlat: deliveryAddress.doorFlat,
        landMark: deliveryAddress.landMark,
      },
      payMode: "Cod",
      onlinePayTime: null,
    };
    const order = await Order.create(orderObj);

    for (let i = 0; i < user.cart.restu.length; i++) {
      const resId = user.cart.restu[i].resId;
      const restu = await Restaurant.findById(resId);
      const resTempObj = {
        orderId: order._id,
        userId: req.user._id,
        foods: user.cart.restu[i].foods,
      };
      restu.resOrder.unshift(resTempObj);
      await restu.save();
    }

    user.cart = {};
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Order Place Successfully",
      order,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createOnlineOrder = async (req, res) => {
  try {
    const {
      isToken,
      deliveryCharg,
      deliveryAddress,
      paymentToken
    } = req.body;

    if (
      (isToken === undefined ||
        !deliveryCharg ||
        !deliveryAddress ||
        deliveryAddress.lat === undefined ||
        deliveryAddress.lon === undefined ||
        !paymentToken
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter Your Address",
      });
    }

    const user = await User.findById(req.user._id);
    if (!(user.cart?.restu.length > 0) || user?.cart?.total === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const tempTotal = user.cart.total;
    let tempToken = 0;
    if (isToken) {
      tempToken = user.token;
    }
    const orderObj = {
      userId: req.user._id,
      orders: {
        restu: user.cart.restu,
        restu: user.cart.restu,
        mrp: tempTotal,
        discount: 0,
        tax: tempTotal * 0.18,
        deliveryCharg: deliveryCharg,
        token: tempToken,
        total: tempTotal + tempTotal * 0.18 + deliveryCharg - tempToken,
      },
      deliveryAddress: {
        latitude: deliveryAddress.lat,
        longitude: deliveryAddress.lon,
        doorFlat: deliveryAddress.doorFlat,
        landMark: deliveryAddress.landMark,
      },
      payMode: "Online",
      isPay: true,
      paymentToken,
    };
    const order = await Order.create(orderObj);

    for (let i = 0; i < user.cart.restu.length; i++) {
      const resId = user.cart.restu[i].resId;
      const restu = await Restaurant.findById(resId);
      const resTempObj = {
        orderId: order._id,
        userId: req.user._id,
        foods: user.cart.restu[i].foods,
      };
      restu.resOrder.unshift(resTempObj);
      await restu.save();
    }

    user.cart = {};
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Order Place Successfully",
      order,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
