const Restaurant = require("../model/Restaurant");
const { sendMail } = require("../utils/sendMail");
const { sendOtp } = require("../utils/sendOtp");
const cloudinary = require("cloudinary");
const ResType = require("../model/Restype");
const Category = require("../model/Categories");
const Order = require("../model/Order");
const DelBoy = require("../model/DelBoy");
const {
  calculatePercentage,
  picChartPercentage,
} = require("../utils/helper/helper");
const Food = require("../model/Food");
const Admin = require("../model/Admin");
const crypto = require("crypto")


exports.resFirstSignUp = async (req, res) => {
  try {
    const { resEmail } = req.body;

    const restu = await Restaurant.findOne({ "resEmail.email": resEmail });
    if (restu) {
      return res.status(500).json({
        success: false,
        message: "Email Already Used",
      });
    }

    otp = Math.floor(Math.random() * 9000) + 1000;
    otp_expired = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newRestu = await Restaurant.create({
      resEmail: {
        email: resEmail,
        otp,
        otp_expired,
      },
    });

    const sendUser = {
      resEmail: {
        email: resEmail,
        isVerify: false,
      },
      verify: false,
    };

    const restoken = await newRestu.CreateToken();

    await sendMail(
      resEmail,
      "Veryfy Your Restaurant Account On HungriTo",
      `Your OTP Is ${otp}`
    );

    return res
      .status(201)
      .cookie("restoken", restoken, {
        httpOnly: true,
        expires: new Date(Date.now() + 22 * 60 * 60 * 1000),
        sameSite: "None",
        secure: true,
      })
      .json({
        restu: sendUser,
        success: true,
        restoken,
      });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resEmailVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "Enter OTP" });
    }

    const restu = await Restaurant.findById(req.restu._id);
    if (restu.resEmail.otp !== otp || restu.resEmail.otp_expired < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP Don't Match And expired" });
    }

    restu.resEmail.otp = null;
    restu.resEmail.otp_expired = null;
    restu.resEmail.isVerify = true;

    await restu.save();
    return res.status(200).json({
      success: true,
      message: "SignUp Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resPhoneMakeOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const restu = await Restaurant.findById(req.restu._id);
    otp = Math.floor(Math.random() * 9000) + 1000;
    restu.resPhone.phone = phone;
    restu.resPhone.otp_expired = new Date(Date.now() + 5 * 60 * 1000);
    restu.resPhone.otp = otp;
    restu.resPhone.isVerify = false;
    const msg = `Your HungriTo OTP Is ${otp}`;
    sendOtp(phone, msg);
    await restu.save();

    const sendRes = { phone: phone, isVerify: false };

    return res.status(200).json({
      restu: sendRes,
      success: true,
      message: `OTP Send On Number ${phone}`,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resPhoneVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    const restu = await Restaurant.findById(req.restu._id);

    if (restu.resPhone.otp !== otp || restu.resPhone.otp_expired < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP DOn't Match And expired" });
    }
    restu.resPhone.otp = null;
    restu.resPhone.otp_expired = null;
    restu.resPhone.isVerify = true;
    await restu.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant Phone Number Verify Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resOwnerPhoneMakeOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const restu = await Restaurant.findById(req.restu._id);
    otp = Math.floor(Math.random() * 9000) + 1000;
    restu.resOwnerPhone.phone = phone;
    restu.resOwnerPhone.otp_expired = new Date(Date.now() + 5 * 60 * 1000);
    restu.resOwnerPhone.otp = otp;
    restu.resOwnerPhone.isVerify = false;
    const msg = `Your HungriTo OTP Is ${otp}`;
    sendOtp(phone, msg);
    await restu.save();

    const sendRes = { phone: phone, isVerify: false };

    return res.status(200).json({
      restu: sendRes,
      success: true,
      message: `OTP Send On Number ${phone}`,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resOwnerPhoneVerify = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    const restu = await Restaurant.findById(req.restu._id);

    if (
      restu.resOwnerPhone.otp !== otp ||
      restu.resOwnerPhone.otp_expired < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "OTP DOn't Match And expired" });
    }
    restu.resOwnerPhone.otp = null;
    restu.resOwnerPhone.otp_expired = null;
    restu.resOwnerPhone.isVerify = true;
    await restu.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant Owner Phone Number Verify Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resPrimarySignUp = async (req, res) => {
  try {
    const {
      resName,
      password,
      resAddress,
      address,
      country,
      state,
      city,
      pincode,
      latitude,
      longitude,
      resPhone,
      resOwnerPhone,
      resOwnerEmail,
      resOwnerName,
    } = req.body;

    if (
      (!resName || !password || !resAddress || !address,
      !country ||
        !state ||
        !city ||
        !pincode ||
        !latitude ||
        !longitude ||
        !resPhone ||
        !resOwnerPhone ||
        !resOwnerEmail ||
        !resOwnerName)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Enter All Fild" });
    }

    const restu = await Restaurant.findById(req.restu._id);
    if (restu.resPhone.isVerify === false) {
      return res.status(400).json({
        success: false,
        message: "Please Verify Restaurant Phone Number",
      });
    }

    if (restu.resOwnerPhone.isVerify === false) {
      return res.status(400).json({
        success: false,
        message: "Please Verify Restaurant Owner Phone Number",
      });
    }

    restu.resName = resName;
    restu.password = password;
    restu.resAddress = resAddress;
    restu.resCompletAddress.address = address;
    restu.resCompletAddress.country = country;
    restu.resCompletAddress.state = state;
    restu.resCompletAddress.city = city;
    restu.resCompletAddress.pincode = pincode;
    // restu.resCompletAddress.latitude = latitude;
    // restu.resCompletAddress.longitude = longitude;
    restu.resLatLong.coordinates = [longitude, latitude];
    restu.resPhone.phone = resPhone;
    restu.resOwnerPhone.phone = resOwnerPhone;
    restu.resOwnerEmail.email = resOwnerEmail;
    restu.resOwnerName = resOwnerName;

    await restu.save();

    return res.status(200).json({
      restu,
      success: true,
      message: "Save Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resSecondaySignUp = async (req, res) => {
  try {
    const {
      resType,
      resCategory,
      resTime,
      sun,
      mon,
      tues,
      wed,
      thurs,
      fri,
      sat,
    } = req.body;
    if (
      resType === undefined ||
      resTime === undefined ||
      resTime.length === 0 ||
      sun === undefined ||
      mon === undefined ||
      tues === undefined ||
      wed === undefined ||
      thurs === undefined ||
      fri === undefined ||
      sat === undefined ||
      resCategory === undefined ||
      resCategory.length <= 0
    ) {
      res.status(400).json({ success: false, message: "Enter All Fild" });
    }

    const restu = await Restaurant.findById(req.restu._id);

    restu.resType = resType;
    restu.resCategory = resCategory;
    restu.resTime = resTime;
    restu.resOpenDays.sun = sun;
    restu.resOpenDays.mon = mon;
    restu.resOpenDays.thurs = thurs;
    restu.resOpenDays.wed = wed;
    restu.resOpenDays.thurs = thurs;
    restu.resOpenDays.fri = fri;
    restu.resOpenDays.sat = sat;

    await restu.save();

    return res.status(200).json({
      restu,
      success: true,
      message: "Save Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resLastSignUp = async (req, res) => {
  try {
    const { img, isOffer, offer } = req.body;

    if (!img || isOffer === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Enter All Fild" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(img, {
      folder: "hungriTo/restaurant",
    });

    const restu = await Restaurant.findById(req.restu._id);

    restu.resFoodImage.publicUrl = myCloud.secure_url;
    restu.resFoodImage.publicId = myCloud.public_id;

    restu.resOffer.isOffer = isOffer;
    restu.resOffer.offer = "";
    if (isOffer) {
      restu.resOffer.offer = offer;
    }

    await restu.save();
    return res.status(200).json({
      restu,
      success: true,
      message: "We Will Contact You After Some Time",
    });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter all fild",
      });
    }

    const restu = await Restaurant.findOne({
      "resEmail.email": email,
      isVerify: true,
    }).select("+password");
    if (!restu) {
      return res.status(400).json({
        success: false,
        message: "Invalide Details",
      });
    }

    if (restu.isVerify === false) {
      return res.status(400).json({
        success: false,
        message: "Invalide Details",
      });
    }

    const isMatch = await restu.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid detail",
      });
    }

    const restoken = await restu.CreateToken();

    return res
      .status(200)
      .cookie("restoken", restoken, {
        httpOnly: true,
        expires: new Date(Date.now() + 22 * 60 * 60 * 1000),
        sameSite: "None",
        secure: true,
      })
      .json({
        success: true,
        message: "Login Successfully",
        restu,
      });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resLogout = async (req, res) => {
  try {
    return res.status(200).cookie("restoken", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: "None",
      secure: true,
    }).json({
      success: true,
      message: "Logout Successfully"
    })
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.loadRes = async (req, res) => {
  try {
    const restu = await Restaurant.findById(req.restu._id);
    return res.status(200).json({ success: true, restu });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resForgotPasswordToken = async (req, res) => {
  try {

    const {email} = req.body;

    if (!email) {
      return res.status(400).json({ message: "Enter Email Address" });
    }    

    const restu = await Restaurant.findOne({"resEmail.email": email, "resEmail.isVerify": true});
    if(!restu){
      return res.status(400).json({ message: "Invalid Email Address" });
    }

    const resetToken = await restu.createForgotPassToken()

    const subject = "HungriTo Forgot Password"

    const text = `HungriTo Forgot Password Link, \n Link: https://hungrito-food.web.app/delboy/reset/password/link/${resetToken} \nif you don't send request for change password then ignore this`
    sendMail(email, subject, text)    

    await restu.save()
    return res.status(200).json({ success: true, message: "Link Send Successfully" });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resResetPassLinkVerify = async (req, res) => {
  try {

    const {forgotPassToken} = req.body;

    if (!forgotPassToken) {
      return res.status(400).json({ message: "Not Have Token Or Password" });
    }    

    const tempToken = crypto.createHash("sha256").update(forgotPassToken).digest("hex")
    console.log(tempToken)
    const restu = await Restaurant.findOne({"forgotPassToken": tempToken, "forgotPassExpired": {$gt: Date.now()} ,"resEmail.isVerify": true})
    if(!restu){
      return res.status(400).json({ message: "Invalid Details Or Link Expired" });
    }

    return res.status(200).json({ success: true, message: "Link Is Correct" });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resResetPassByLink = async (req, res) => {
  try {

    const {forgotPassToken, password} = req.body;

    if (!forgotPassToken || !password) {
      return res.status(400).json({ message: "Not Have Token Or Password" });
    }    

    const tempToken = crypto.createHash("sha256").update(forgotPassToken).digest("hex")
    const restu = await Restaurant.findOne({"forgotPassToken": tempToken, "forgotPassExpired": {$gt: Date.now()} ,"resEmail.isVerify": true})
    if(!restu){
      return res.status(400).json({ message: "Invalid Details Or Link Expired" });
    }

    restu.password = password
    restu.forgotPassToken = null
    restu.forgotPassExpired = null
    await restu.save()

    return res.status(200).json({ success: true, message: "Password Change Successfully" });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getResType = async (req, res) => {
  try {
    const resTypes = await ResType.find();
    return res.status(200).json({ success: true, resTypes });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getResNewOrder = async (req, res) => {
  try {
    const orders = await Order.find({
      "orders.restu.resId": req.restu._id,
      "orders.restu.resStatus": "pending",
      "status": {
         $nin: ["cancel by user", "cancel by res"] 
      }
    })
      .populate({ path: "orders.restu.foods.foodId", select: "foodWeight" })
      .populate({ path: "userId", select: "username" })
      .sort({ creatdAt: -1 });

    // const orders = await Order.find({
    //   "orders.restu.resId": req.restu._id,
    //   "orders.restu.resStatus": "pending",
    // })
    //   .populate({ path: "orders.restu.foods.foodId", select: "foodWeight" })
    //   .populate({ path: "userId", select: "username" })
    //   .sort({ creatdAt: -1 });

    // for(let i=0; i<orders?.length; i++){
    //   if (orders[i]?.orders?.restu?.length > 0) {
    //     const restuIndex = orders[i]?.orders?.restu?.findIndex(
    //       (obj) => obj.resId.toString() === req.restu._id.toString()
    //     );
    //     if (restuIndex !== -1) {
    //       orders[i].orders.restu = orders[i].orders.restu.filter(
    //         (e) => e.resId.toString() === req.restu._id.toString()
    //         );
    //     }
    //   }
    // }

    let sendOrders = [];
    let index = 0;
    for (let i = 0; i < orders?.length; i++) {
      for (let j = 0; j < orders[i]?.orders?.restu.length; j++) {
        if (
          orders[i]?.orders?.restu[j].resId.toString() ===
            req.restu._id.toString() &&
          orders[i]?.orders?.restu[j].isAccept === false
        ) {
          sendOrders[index] = orders[i];
          sendOrders[index].orders.restu = orders[i]?.orders?.restu[j];
          index++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      orders: sendOrders,
    });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resAcceptOrder = async (req, res) => {
  try {
    const { ordId } = req.params;

    if (!ordId) {
      return res.state(400).json({
        success: false,
        message: "Please Give Ord Id",
      });
    }

    const order = await Order.findById(ordId);
    const restu = await Restaurant.findById(req.restu._id);

    if (!order) {
      return res.state(400).json({
        success: false,
        message: "Order not find",
      });
    }

    let sendDelBoyLiveOrd = false;
    if (order.status === "new") {
      sendDelBoyLiveOrd = true;
      order.status = "res accept";
      order.resLatLong.coordinates = restu.resLatLong.coordinates;

      const delBoy = await DelBoy.findOne({
        "dbCurrentLoc.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: restu.resLatLong.coordinates,
            },
            $maxDistance: 15000,
          },
        },
        active: { $eq: true },
        isAvilable: { $eq: true },
        money: { $gt: 199 },
      });

      // console.log(delBoy)

      if (delBoy && delBoy?.isAvilable === true && delBoy?.active === true) {
        order.deliveryBoyId = delBoy._id;
        delBoy.isAvilable = false;
        await delBoy.save();

        for (let i = 0; i < order?.orders?.restu.length; i++) {
          const resForMoney = await Restaurant.findById(
            order?.orders?.restu[i]?.resId
          );
          if (resForMoney) {
            resForMoney.money += order?.orders?.restu[i].resSubTotal;
            await resForMoney.save();
          }
        }

        // await order.save();
      } else {
        return res.status(401).json({
          success: false,
          message: "Delivery Boy Not Available",
        });
      }
    }

    const resIndex = order.orders.restu.findIndex(
      (obj) => obj.resId.toString() === restu._id.toString()
    );
    if (resIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Somthing Went Wrong",
      });
    }

    if (order.orders.restu[resIndex].isAccept === false) {
      order.orders.restu[resIndex].isAccept = true;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order Accepted",
      sendDelBoyLiveOrd,
    });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resCancelOrder = async(req, res)=>{
  try {
    const {ordId} = req.params

    if(!ordId){
      return res.status(400).json({
        success: false,
        message: "ord id not have",
      });
    }

    const order = await Order.findById(ordId)

    if(!order){
      return res.status(400).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if(order.status === "new"){
      if(order.payMode !== "Online"){
        const admin = await Admin.findOne({email: "admin@gmail.com"})
        if(!admin){
          return res.status(400).json({
            success: false,
            message: "There is isuue",
          });
        }
        admin.money -= order?.orders?.total
        await admin.save()
      }
      order.status = "cancel by res"
      await order.save()
      return res.status(200).json({
        success: true,
        message: "Order Deleted",
      });

    } else {
      return res.status(400).json({
        success: false,
        message: "Order Accepted So You Can't Cancel",
      });
    }

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getResOrderList= async (req, res) => {
  try {
    const orders = await Order.find({
      "orders.restu.resId": req.restu._id,
    }).populate({ path: "orders.restu.foods.foodId", select: "foodWeight" }).populate({ path: "userId", select: "username" }).sort({ creatdAt: -1 });

    let sendOrders = [];
    let index = 0;
    for (let i = 0; i < orders?.length; i++) {
      for (let j = 0; j < orders[i]?.orders?.restu.length; j++) {
        if (
          orders[i]?.orders?.restu[j].resId.toString() ===
            req.restu._id.toString() 
        ) {
          // sendOrders[index] = orders[i];
          // sendOrders[index].orders.restu = orders[i]?.orders?.restu[j];
          sendOrders[index] = {
            username:  orders[i]?.userId?.username,
            orderTokne: orders[i]?.OrderTokne,
            resSubTotal: orders[i]?.orders?.restu[j]?.resSubTotal,
            _id: orders[i]._id,
            payMode: orders[i]?.payMode,
            isView: orders[i]?.status === "res accept" ? true : false
          }
          index++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      orders: sendOrders,
    })

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


exports.resDashCharts = async (req, res) => {
  try {
    let topFourCart = {};
    let pieChart = {};

    const today = new Date();
    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };
    var previousMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    var previousYear =
      today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    var previousDate = new Date(today);
    // previousDate.setDate(today.getDate() - 1);
    previousDate.setHours(0)
    previousDate.setMinutes(0)
    previousDate.setSeconds(0)

    const lastMonth = {
      start: new Date(previousYear, previousMonth, 1),
      end: new Date(previousYear, today.getMonth(), 0),
    };

    let lastWeekDate = {};
    for (let i = 0; i < 7; i++) {
      let dayMonth = today.getMonth();
      if (today.getDate() < today.getDate() - i) {
        dayMonth -= 1;
      }
      let day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i
      );
      day.setHours(0,0,0)
      let dayName = day.toLocaleDateString("en-US", { weekday: "short" });
      lastWeekDate = { ...lastWeekDate, [dayName]: day };
    }

    const todayOrder = await Order.find({
      "orders.restu.resId": req.restu._id,
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt: {
        $gt: previousDate,
        $lt: today,
      },
    });

    const lastOrder = await Order.find({
      "orders.restu.resId": req.restu._id,
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt: {
        $gt: new Date(
          today.getFullYear(),
          today.getMonth(),
          previousDate.getDate() 
        ).setHours(0,0,0),
        $lte: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ).setHours(0,0,0),  
      },
    });

    const totalFood = await Food.find({
      foodRestaurant: req.restu._id,
      isDelete: false,
    });

    const todayFood = await Food.find({
      foodRestaurant: req.restu._id,
      isDelete: false,
      creatdAt: {
        $gt: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const lastFood = await Food.find({
      foodRestaurant: req.restu._id,
      isDelete: false,
      creatdAt: {
        $gt: previousDate,
        $lt: today,
      },
    });

    let todayIncome = 0;
    let lastDayIncome = 0;

    for (let i = 0; i < todayOrder.length; i++) {
      for (let j = 0; j < todayOrder[i]?.orders?.restu?.length; j++) {
        if (
          todayOrder[i]?.orders?.restu[j]?.resId?.toString() ===
          req.restu._id.toString()
        ) {
          todayIncome += Number(
            todayOrder[i]?.orders?.restu[j]?.resSubTotal || 0
          );
        }
      }
    }

    for (let i = 0; i < lastOrder.length; i++) {
      for (let j = 0; j < lastOrder[i]?.orders?.restu?.length; j++) {
        if (
          lastOrder[i]?.orders?.restu[j]?.resId?.toString() ===
          req.restu._id.toString()
        ) {
          lastDayIncome += Number(
            lastOrder[i]?.orders?.restu[j]?.resSubTotal || 0
          );
        }
      }
    }

    const thisMonthOrder = await Order.find({
      "orders.restu.resId": req.restu._id,
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt: {
        $gt: thisMonth.start,
        $lt: thisMonth.end,
      },
    });

    const lastMonthOrder = await Order.find({
      "orders.restu.resId": req.restu._id,
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt: {
        $gt: lastMonth.start,
        $lt: lastMonth.end,
      },
    });

    let thisMonthIncome = 0;
    let lastMontIncome = 0;

    for (let i = 0; i < thisMonthOrder.length; i++) {
      for (let j = 0; j < thisMonthOrder[i]?.orders?.restu?.length; j++) {
        if (
          thisMonthOrder[i]?.orders?.restu[j]?.resId?.toString() ===
          req.restu._id.toString()
        ) {
          thisMonthIncome += Number(
            thisMonthOrder[i]?.orders?.restu[j]?.resSubTotal || 0
          );
        }
      }
    }

    for (let i = 0; i < lastMonthOrder.length; i++) {
      for (let j = 0; j < lastMonthOrder[i]?.orders?.restu?.length; j++) {
        if (
          lastMonthOrder[i]?.orders?.restu[j]?.resId?.toString() ===
          req.restu._id.toString()
        ) {
          lastMontIncome += Number(
            lastMonthOrder[i]?.orders?.restu[j]?.resSubTotal || 0
          );
        }
      }
    }

    let vegFood = 0;
    let nonVegFood = 0;
    let avilableFood = 0;
    for (let i = 0; i < totalFood.length; i++) {
      if (totalFood[i]?.foodType === "Veg") {
        vegFood += 1;
      } else if (totalFood[i]?.foodType === "Non Veg") {
        nonVegFood += 1;
      }
      if (totalFood[i].isAvailable === true) {
        avilableFood += 1;
      }
    }

    const todayOrderPercent = calculatePercentage(
      todayOrder.length,
      lastOrder.length
    );
    const todayFoodPercent = calculatePercentage(
      todayFood.length,
      lastFood.length
    );
    const todayIncomePercent = calculatePercentage(todayIncome, lastDayIncome);
    const thisMonthIncomePercent = calculatePercentage(
      thisMonthIncome,
      lastMontIncome
    );

    const vegFoodPercent = picChartPercentage(vegFood, totalFood.length);
    const nonVegFoodPercent = picChartPercentage(nonVegFood, totalFood.length);
    const avilableFoodPercent = picChartPercentage(
      avilableFood,
      totalFood.length
    );

    topFourCart = {
      todayOrder: {
        count: todayOrder.length,
        percentage: todayOrderPercent,
      },
      totalFood: {
        count: totalFood.length,
        percentage: todayFoodPercent,
      },
      todayIncome: {
        count: todayIncome,
        percentage: todayIncomePercent,
      },
      thisMonthIncome: {
        count: thisMonthIncome,
        percentage: thisMonthIncomePercent,
      },
    };

    pieChart = {
      vegFood: {
        count: vegFood,
        percentage: vegFoodPercent,
      },
      nonVegFood: {
        count: nonVegFood,
        percentage: nonVegFoodPercent,  
      },
      avilableFood: {
        count: avilableFood,
        percentage: avilableFoodPercent,
      },
    };

    const orderedDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const areaChart = [];
    const weekRevenueChart = [];
    for (let i = 0; i < orderedDays.length; i++) {
      const order = await Order.find({
        "orders.restu.resId": req.restu._id,
        status: {
          $nin: ["cancel by user", "cancel by res"]
        },
        creatdAt: {
          $gt: new Date(
            lastWeekDate[orderedDays[i]].getFullYear(),
            lastWeekDate[orderedDays[i]].getMonth(),
            lastWeekDate[orderedDays[i]].getDate() 
          ).setHours(0,0,0),
          $lt:new Date(
            lastWeekDate[orderedDays[i]].getFullYear(),
            lastWeekDate[orderedDays[i]].getMonth(),
            lastWeekDate[orderedDays[i]].getDate()+1
          ).setHours(0,0,0)
        },
      });
      areaChart.push(order.length);
      let income = 0;
      order.forEach((o)=>{
        const resIndex = o?.orders.restu?.findIndex(obj=> obj.resId.toString() === req.restu._id.toString())
        if(resIndex !== -1){
          income += o?.orders?.restu[resIndex]?.resSubTotal
        }
      })
      weekRevenueChart.push(income)
    }

    const thisYearRevenue = new Array(12).fill(0)
    const lastYearRevenue = new Array(12).fill(0)
    const thisYearOrder = await Order.find({
      "orders.restu.resId": req.restu._id,
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt:{
        $gt: new Date(today.getFullYear(), 0, 1),
        $lt: today
      }
    })

    const lastYearOrder = await Order.find({
      "orders.restu.resId": req.restu._id,
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt:{
        $gt: new Date(today.getFullYear()-1, 0, 1),
        $lt: new Date(today.getFullYear(), 0, 1)
      }
    })

    thisYearOrder.forEach((order)=>{
      const creationDate = order?.creatdAt
      const resIndex = order?.orders.restu?.findIndex(obj=> obj.resId.toString() === req.restu._id.toString())
      if(resIndex !== -1){
        thisYearRevenue[creationDate.getMonth()] += order?.orders?.restu[resIndex]?.resSubTotal
      }
    })

    lastYearOrder.forEach((order)=>{
      const creationDate = order?.creatdAt
      const resIndex = order?.orders.restu?.findIndex(obj=> obj.resId.toString() === req.restu._id.toString())
      if(resIndex !== -1){
        lastYearRevenue[creationDate.getMonth()] += order?.orders?.restu[resIndex]?.resSubTotal
      }
    })

    return res.status(200).json({
      success: true,
      topFourCart,
      pieChart,
      areaChart,
      thisYearRevenue,
      lastYearRevenue,
      weekRevenueChart,
    });

  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


