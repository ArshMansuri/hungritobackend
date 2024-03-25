const Restaurant = require("../model/Restaurant");
const User = require("../model/User");
const Food = require("../model/Food");
const { sendOtp } = require("../utils/sendOtp");
const cloudinary = require("cloudinary");
const Order = require("../model/Order");
const Filter = require("../model/Filter");

exports.userSignUp = async (req, res) => {
  try {
    const { username, phone, password, img } = req.body;

    if (!username || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter All Fild" });
    }

    let user = await User.findOne({ "phone.phone": phone });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Already Used Phone Number" });
    }

    otp = Math.floor(Math.random() * 9000) + 1000;
    otp_expired = new Date(Date.now() + 5 * 60 * 1000);

    const phoneObj = {
      phone: phone,
      otp: otp,
      otp_expired: otp_expired,
    };

    let newUser = {};
    if (img) {
      const myCloud = await cloudinary.v2.uploader.upload(img, {
        folder: "hungriTo/userAvatar",
      });
      profilImg = myCloud.secure_url;
      newUser = await User.create({
        username,
        phone: phoneObj,
        password,
        profilImg,
      });
    } else {
      newUser = await User.create({
        username,
        phone: phoneObj,
        password,
      });
    }

    const sendUser = {
      username: newUser.username,
      phone: newUser.phone.phone,
      verify: newUser.verify,
      profilImg: newUser.profilImg,
    };

    //temp phone = ""
    sendOtp("9574478944", `Veryfy Your Account On HUNGRITO Your OTP Is ${otp}`);

    return res.status(201).json({
      user: sendUser,
      success: true,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter All Fild" });
    }

    const user = await User.findOne({ "phone.phone": phone }).select(
      "+password"
    );

    if (!user || user.phone.isVerify === false) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Detals" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Detals" });
    }

    const token = await user.CreateToken();

    let sendUser = user;
    sendUser.password = "";

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sameSite: "None",
        secure: true,
      })
      .json({
        user: sendUser,
        token,
        success: true,
      });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.userOtpVerify = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "Enter OPT" });
    }

    if (!phone) {
      return res.status(400).json({ message: "Invalid inputs" });
    }

    const user = await User.findOne({ "phone.phone": phone });
    if (!user || user.phone.isVerify === true || phone !== user.phone.phone) {
      return res.status(400).json({ message: "Invalid inputs" });
    }

    if (user.phone.otp !== otp || user.phone.otp_expired < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP DOn't Match And expired" });
    }

    user.phone.otp = null;
    user.phone.otp_expired = null;
    user.phone.isVerify = true;
    user.verify = true;

    const token = await user.CreateToken();
    await user.save();
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sameSite: "None",
        secure: true,
      })
      .json({ success: true, message: "SignUp Successfully", token });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.loadUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNearestRes = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(404).json({
        success: false,
        message: "Don't have your loaction",
      });
    }

    // const restus = await Restaurant.find({
    //   resLatLong: {
    //     $near: {
    //       $geometry: {
    //         type: "Point",
    //         coordinates: [longitude, latitude],
    //       },
    //       $maxDistance: 15000,
    //     },
    //   },
    // }).populate("resCategory");

    // const restus = await Restaurant.aggregate([
    //   {
    //     $geoNear: {
    //       near: {
    //         type: "Point",
    //         coordinates: [longitude, latitude],
    //       },
    //       distanceField: "distance",
    //       maxDistance: 15000,
    //       spherical: true,
    //     },
    //   },
    //   {
    //     $sort: {
    //       distance: 1,
    //     },
    //   },
    // ]).lookup({
    //   from: "resCategories",
    //   localField: "resCategory",
    //   foreignField: "_id",
    //   as: "resCategory",
    // });

    const restus = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: 15000,
          spherical: true,
        },
      },
      {
        $match: {
          isVerify: true 
        }
      },
      {
        $sort: {
          distance: 1,
        },
      },
      {
        $lookup: {
          from: "resCategories",
          localField: "resCategory",
          foreignField: "_id",
          as: "resCategory",
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    const filters = await Filter.find()

    return res.status(200).json({
      success: true,
      restus,
      filters
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getResFood = async (req, res) => {
  try {
    const { resId } = req.params;

    if (!resId) {
      return res.status(401).json({
        success: false,
        message: "Don't have resId",
      });
    }

    const foods = await Restaurant.findById(resId).populate({
      path: "foodList",
      match: { isDelete: false },
    });

    return res.status(200).json({
      success: true,
      foods: foods?.foodList || [],
      resName: foods?.resName || "",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyCartDetail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "cart.restu.resId",
      select: "resLatLong.coordinates",
    });

    return res.status(200).json({
      success: true,
      cart: user?.cart || [],
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { resId, resName, foodId, foodName, foodPrice, foodQut, foodImg } =
      req.body;

    if (
      !resId ||
      !resName ||
      !foodId ||
      !foodName ||
      !foodPrice ||
      !foodQut ||
      !foodImg
    ) {
      return res.status(200).json({
        success: false,
        message: "Enter All Details",
      });
    }

    const user = await User.findById(req.user._id);
    const restuIndex = user.cart.restu.findIndex(
      (obj) => obj.resId.toString() === resId
    );

    if (restuIndex !== -1) {
      const foodIndex = user.cart.restu[restuIndex].foods.findIndex(
        (obj) => obj.foodId.toString() === foodId
      );
      if (foodIndex !== -1) {
        user.cart.restu[restuIndex].foods[foodIndex].foodName = foodName;
        user.cart.restu[restuIndex].foods[foodIndex].foodPrice = foodPrice;
        user.cart.restu[restuIndex].foods[foodIndex].foodImg = foodImg;
        user.cart.restu[restuIndex].foods[foodIndex].foodQut += foodQut;
        user.cart.restu[restuIndex].foods[foodIndex].subTotal +=
          foodPrice * foodQut;
      } else {
        const foodObj = {
          foodId,
          foodName,
          foodPrice,
          foodQut,
          subTotal: foodPrice * foodQut,
          foodImg,
        };
        user.cart.restu[restuIndex].foods.push(foodObj);
      }
      user.cart.restu[restuIndex].resSubTotal += foodPrice * foodQut;
    } else {
      const foodObj = {
        foodId,
        foodName,
        foodPrice,
        foodQut,
        subTotal: foodPrice * foodQut,
        foodImg,
      };
      const resObj = {
        resId,
        resName,
        foods: [foodObj],
        resSubTotal: foodPrice * foodQut,
      };
      user.cart.restu.push(resObj);
    }

    user.cart.total += foodPrice * foodQut;

    await user.save();

    res.status(200).json({
      success: true,
      cart: user.cart,
      message: "Add In Card Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { resId, foodId } = req.body;

    if (!resId || !foodId) {
      return res.status(200).json({
        success: false,
        message: "Enter All Details",
      });
    }

    const user = await User.findById(req.user._id);
    const restuIndex = user.cart.restu.findIndex(
      (obj) => obj.resId.toString() === resId
    );

    if (restuIndex !== -1) {
      const foodIndex = user.cart.restu[restuIndex].foods.findIndex(
        (obj) => obj.foodId.toString() === foodId
      );
      if (foodIndex !== -1) {
        const tempFoodSubTotal =
          user.cart.restu[restuIndex].foods[foodIndex].subTotal;
        if (user.cart.restu[restuIndex].foods.length === 1) {
          user.cart.restu.splice(restuIndex, 1);
        } else {
          user.cart.restu[restuIndex].foods.splice(foodIndex, 1);
          user.cart.restu[restuIndex].resSubTotal -= tempFoodSubTotal;
        }
        user.cart.total -= tempFoodSubTotal;
      }
    }

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Remove From Cart",
      cart: user.cart,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.increaseQutOfCartFood = async (req, res) => {
  try {
    const { resId, foodId } = req.body;

    if (!resId || !foodId) {
      return res.status(200).json({
        success: false,
        message: "Enter All Details",
      });
    }

    const user = await User.findById(req.user._id);

    const restuIndex = user.cart.restu.findIndex(
      (obj) => obj.resId.toString() === resId
    );

    if (restuIndex !== -1) {
      const foodIndex = user.cart.restu[restuIndex].foods.findIndex(
        (obj) => obj.foodId.toString() === foodId
      );
      if (foodIndex !== -1) {
        const tempFoodPrice =
          user.cart.restu[restuIndex].foods[foodIndex].foodPrice;
        if (user.cart.restu[restuIndex].foods[foodIndex].foodQut === 10) {
          return res.status(401).json({
            success: false,
            message: "Can't Add more then 10",
          });
        } else {
          user.cart.restu[restuIndex].foods[foodIndex].foodQut += 1;
          user.cart.restu[restuIndex].foods[foodIndex].subTotal +=
            tempFoodPrice;
          user.cart.restu[restuIndex].resSubTotal += tempFoodPrice;
        }
        user.cart.total += tempFoodPrice;
      }
    }

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Cart Update Successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.decreaseQutOfCartFood = async (req, res) => {
  try {
    const { resId, foodId } = req.body;

    if (!resId || !foodId) {
      return res.status(200).json({
        success: false,
        message: "Enter All Details",
      });
    }

    const user = await User.findById(req.user._id);

    const restuIndex = user.cart.restu.findIndex(
      (obj) => obj.resId.toString() === resId
    );

    if (restuIndex !== -1) {
      const foodIndex = user.cart.restu[restuIndex].foods.findIndex(
        (obj) => obj.foodId.toString() === foodId
      );
      if (foodIndex !== -1) {
        const tempFoodPrice =
          user.cart.restu[restuIndex].foods[foodIndex].foodPrice;
        if (user.cart.restu[restuIndex].foods[foodIndex].foodQut === 1) {
          if (user.cart.restu[restuIndex].foods.length === 1) {
            user.cart.restu.splice(restuIndex, 1);
          } else {
            user.cart.restu[restuIndex].foods.splice(restuIndex, 1);
            user.cart.restu[restuIndex].resSubTotal -= tempFoodPrice;
          }
        } else {
          user.cart.restu[restuIndex].foods[foodIndex].foodQut -= 1;
          user.cart.restu[restuIndex].foods[foodIndex].subTotal -=
            tempFoodPrice;
          user.cart.restu[restuIndex].resSubTotal -= tempFoodPrice;
        }
        user.cart.total -= tempFoodPrice;
      }
    }

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Cart Update Successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addOrRemoveFoodInSave = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Don't have foodid",
      });
    }

    const user = await User.findById(req.user._id).select("saveFood");
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(400).json({
        success: false,
        message: "Food Not Found",
      });
    }

    const index = user.saveFood.indexOf(foodId);
    if (index !== -1) {
      user.saveFood.splice(index, 1);
    } else {
      user.saveFood.unshift(foodId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Food Save Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMySaveFoods = async (req, res) => {
  try {
    const foods = await User.findById(req.user._id)
      .populate({
        path: "saveFood",
        populate: { path: "foodRestaurant", select: "_id resName" },
      })
      .select("saveFood");

    return res.status(200).json({
      success: true,
      foods: foods.saveFood,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({ path: "orders.restu.foods.foodId", select: "foodWeight" })
      .sort({ creatdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyActiveOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ status: "res accept" }, { status: "new" }, { status: "on way" }],
    }).populate({ path: "orders.restu.foods.foodId", select: "foodWeight" });

    return res.status(200).json({
      success: true, 
      order
    })

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
