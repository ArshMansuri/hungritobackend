const DelBoy = require("../model/DelBoy");
const Order = require("../model/Order");
const Admin = require("../model/Admin");
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
      if(user.token < 50){
        tempToken = user.token;
        user.token = 0;
      } else {
        tempToken = 50;
        user.token = (user.token - 50);
      }
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
      isApplayToken: isToken
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

    const admin = await Admin.findOne({email: "admin@gmail.com"})
    if(!admin){
      return res.status(400).json({
        success: false,
        message: "There is isuue",
      });
    }
    admin.money += order?.orders?.total
    await admin.save()

    user.cart = {};
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Order Place Successfully",
      orderId: order._id,
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
      if(user.token < 50){
        tempToken = user.token;
        user.token = 0;
      } else {
        tempToken = 50;
        user.token = (user.token - 50);
      }
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
      isApplayToken: isToken
    };
    const order = await Order.create(orderObj);

    for (let i = 0; i < user.cart.restu.length; i++) {
      const resId = user.cart.restu[i].resId;
      const restu = await Restaurant.findById(resId);
      // restu.money += user.cart.restu[i].resSubTotal 
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

    const admin = await Admin.findOne({email: "admin@gmail.com"}) 
    if(!admin){
      return res.status(400).json({
        success: false,
        message: "There is isuue",
      });
    }
    console.log(admin)
    console.log(admin.username)
    console.log(admin.money)
    console.log(order?.orders?.total)
    admin.money += order?.orders?.total || 1000
    await admin.save()
    
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
