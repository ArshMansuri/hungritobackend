const DelBoy = require("../model/DelBoy");
const Order = require("../model/Order");
const { picChartPercentage, calculatePercentage } = require("../utils/helper/helper");
const { sendMail } = require("../utils/sendMail");
const { sendOtp } = require("../utils/sendOtp");
const cloudinary = require("cloudinary");
const crypto = require("crypto")

exports.dbFirstSignUp = async (req, res) => {
  try {
    const { dbEmail } = req.body;

    const dBoy = await DelBoy.findOne({ "dbEmail.email": dbEmail });

    if (dBoy?.dbEmail?.isVerify === true) {
      return res.status(500).json({
        success: false,
        message: "Email Already Used",
      });
    }

    otp = Math.floor(Math.random() * 9000) + 1000;
    otp_expired = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newDelBoy = await DelBoy.create({
      dbEmail: {
        email: dbEmail,
        otp,
        otp_expired,
      },
    });

    const sendUser = {
      dbEmail: {
        email: dbEmail,
        isVerify: false,
      },
      verify: false,
    };

    const delBoyToken = await newDelBoy.CreateToken();

    await sendMail(
      dbEmail,
      "Veryfy Your Restaurant Account On HungriTo",
      `Your OTP Is ${otp}`
    );

    return res
      .status(201)
      .cookie("delboytoken", delBoyToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 22 * 60 * 60 * 1000),
        sameSite: "None",
        secure: true,
      })
      .json({
        delBoy: sendUser,
        success: true,
        delBoyToken,
      });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.dbEmailVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "Enter OPT" });
    }

    const delBoy = await DelBoy.findById(req.delBoy._id);
    if (delBoy.dbEmail.otp !== otp || delBoy.dbEmail.otp_expired < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP Don't Match And expired" });
    }

    delBoy.dbEmail.otp = null;
    delBoy.dbEmail.otp_expired = null;
    delBoy.dbEmail.isVerify = true;

    await delBoy.save();
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

exports.dbPhoneMakeOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    let delBoy = await DelBoy.findOne({ "dbPhone.phone": phone });

    if (delBoy && delBoy._id.toString() !== req.delBoy._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Phone Number Already Used",
      });
    }

    delBoy = await DelBoy.findById(req.delBoy._id);

    otp = Math.floor(Math.random() * 9000) + 1000;
    delBoy.dbPhone.phone = phone;
    delBoy.dbPhone.otp_expired = new Date(Date.now() + 5 * 60 * 1000);
    delBoy.dbPhone.otp = otp;
    delBoy.dbPhone.isVerify = false;
    const msg = `Your HungriTo OTP Is ${otp}`;
    sendOtp(phone, msg);
    await delBoy.save();

    const sendRes = { phone: phone, isVerify: false };

    return res.status(200).json({
      delBoy: sendRes,
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

exports.dbPhoneVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    const delBoy = await DelBoy.findById(req.delBoy._id);

    if (delBoy.dbPhone.otp !== otp || delBoy.dbPhone.otp_expired < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP DOn't Match And expired" });
    }
    delBoy.dbPhone.otp = null;
    delBoy.dbPhone.otp_expired = null;
    delBoy.dbPhone.isVerify = true;
    await delBoy.save();

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

exports.dbPrimarySignUp = async (req, res) => {
  try {
    const {
      dbName,
      password,
      dbAddress,
      address,
      country,
      state,
      city,
      pincode,
      latitude,
      longitude,
      dbPhone,
    } = req.body;

    if (
      (!dbName || !password || !dbAddress || !address,
      !country ||
        !state ||
        !city ||
        !pincode ||
        !latitude ||
        !longitude ||
        !dbPhone)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Enter All Fild" });
    }

    const delBoy = await DelBoy.findById(req.delBoy._id);

    if (delBoy.dbPhone.isVerify === false) {
      return res.status(400).json({
        success: false,
        message: "Please Verify Your Phone Number",
      });
    }

    delBoy.dbName = dbName;
    delBoy.password = password;
    delBoy.dbAddress = dbAddress;
    delBoy.dbCompletAddress.address = address;
    delBoy.dbCompletAddress.country = country;
    delBoy.dbCompletAddress.state = state;
    delBoy.dbCompletAddress.city = city;
    delBoy.dbCompletAddress.pincode = pincode;
    delBoy.dbLatLong.coordinates = [longitude, latitude];
    delBoy.dbPhone.phone = dbPhone;

    await delBoy.save();

    return res.status(200).json({
      delBoy,
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

exports.dbLastSignUp = async (req, res) => {
  try {
    const { dbImg, dbVehicleImg, dbLicenseImg } = req.body;

    if (!dbImg || !dbVehicleImg || !dbLicenseImg) {
      return res
        .status(400)
        .json({ success: false, message: "Enter All Fild" });
    }

    const delBoy = await DelBoy.findById(req.delBoy._id);

    const dbImgCloud = await cloudinary.v2.uploader.upload(dbImg, {
      folder: "hungriTo/deliveryBoy",
    });
    const dbVehicleImgCloud = await cloudinary.v2.uploader.upload(
      dbVehicleImg,
      {
        folder: "hungriTo/dbVehicle",
      }
    );
    const dbLicenseImgCloud = await cloudinary.v2.uploader.upload(
      dbLicenseImg,
      {
        folder: "hungriTo/dbLicense",
      }
    );

    delBoy.dbImage.publicUrl = dbImgCloud.secure_url;
    delBoy.dbImage.publicId = dbImgCloud.public_id;
    delBoy.dbVihicalImage.publicUrl = dbVehicleImgCloud.secure_url;
    delBoy.dbVihicalImage.publicId = dbVehicleImgCloud.public_id;
    delBoy.dbLicenseImage.publicUrl = dbLicenseImgCloud.secure_url;
    delBoy.dbLicenseImage.publicId = dbLicenseImgCloud.public_id;

    await delBoy.save();

    return res.status(200).json({
      delBoy,
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

exports.dbLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter all fild",
      });
    }

    const delBoy = await DelBoy.findOne({
      "dbPhone.phone": phone,
      "dbPhone.isVerify": true,
    }).select("+password");
    console.log(delBoy);
    if (!delBoy) {
      return res.status(400).json({
        success: false,
        message: "Invalide Details a",
      });
    }

    if (delBoy.isVerify === false) {
      return res.status(400).json({
        success: false,
        message: "Invalide Details b",
      });
    }

    const isMatch = await delBoy.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid detail",
      });
    }

    const delBoyToken = await delBoy.CreateToken();

    return res
      .status(200)
      .cookie("delboytoken", delBoyToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 22 * 60 * 60 * 1000),
        sameSite: "None",
        secure: true,
      })
      .json({
        success: true,
        message: "Login Successfully",
        delBoy,
      });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.dbLogout = async (req, res) => {
  try {
    return res.status(200).cookie("delboytoken", null, {
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

exports.loadDb = async (req, res) => {
  try {
    const delBoy = await DelBoy.findById(req.delBoy._id);
    let userId = null
    if(delBoy?.active === true && delBoy.isAvilable === false){
      const order = await Order.findOne({deliveryBoyId: req.delBoy._id, status: "on way"}).select("userId")
      if(order){
        userId = order?.userId
      }
    }

    return res.status(200).json({ success: true, delBoy, userId });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.dbForgotPasswordToken = async (req, res) => {
  try {

    const {email} = req.body;

    if (!email) {
      return res.status(400).json({ message: "Enter Email Address" });
    }    

    const delBoy = await DelBoy.findOne({"dbEmail.email": email, "dbEmail.isVerify": true});
    if(!delBoy){
      return res.status(400).json({ message: "Invalid Email Address" });
    }

    const resetToken = await delBoy.createForgotPassToken()

    const subject = "HungriTo Forgot Password"

    const text = `HungriTo Forgot Password Link, \n Link: https://hungrito-food.web.app/delboy/reset/password/link/${resetToken} \nif you don't send request for change password then ignore this`
    sendMail(email, subject, text)    

    await delBoy.save()
    return res.status(200).json({ success: true, message: "Link Send Successfully" });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.dbResetPassLinkVerify = async (req, res) => {
  try {

    const {forgotPassToken} = req.body;

    if (!forgotPassToken) {
      return res.status(400).json({ message: "Not Have Token Or Password" });
    }    

    const tempToken = crypto.createHash("sha256").update(forgotPassToken).digest("hex")
    const delBoy = await DelBoy.findOne({"forgotPassToken": tempToken, "forgotPassExpired": {$gt: Date.now()} ,"dbEmail.isVerify": true})
    if(!delBoy){
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

exports.dbResetPassByLink = async (req, res) => {
  try {

    const {forgotPassToken, password} = req.body;

    if (!forgotPassToken || !password) {
      return res.status(400).json({ message: "Not Have Token Or Password" });
    }    

    const tempToken = crypto.createHash("sha256").update(forgotPassToken).digest("hex")
    const delBoy = await DelBoy.findOne({"forgotPassToken": tempToken, "forgotPassExpired": {$gt: Date.now()} ,"dbEmail.isVerify": true})
    if(!delBoy){
      return res.status(400).json({ message: "Invalid Details Or Link Expired" });
    }

    delBoy.password = password
    delBoy.forgotPassToken = null
    delBoy.forgotPassExpired = null
    await delBoy.save()

    return res.status(200).json({ success: true, message: "Password Change Successfully" });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDbNewOrders = async (req, res) => {
  try {

    // const orders = await Order.aggregate([
    //   {
    //     $geoNear: {
    //       near: {
    //         type: "Point",
    //         coordinates: [longitude, latitude],
    //       },
    //       distanceField: "distance",
    //       maxDistance: 5000,
    //       spherical: true,
    //     },
    //   },
    //   {
    //     $match: {
    //       status: "res accept",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "userId",
    //       foreignField: "_id",
    //       pipeline: [
    //         {
    //           $project: {
    //             _id: 0,
    //             username: "$username",
    //           },
    //         },
    //       ],
    //       as: "user",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "restaurants",
    //       localField: "orders.restu.resId",
    //       foreignField: "_id",
    //       pipeline: [
    //         {
    //           $project: {
    //             _id: 1,
    //             resName: "$resName",
    //             resAddress: "$resAddress",
    //             resLatLong: "$resLatLong",
    //           },
    //         },
    //       ],
    //       as: "restaurantAddresses",
    //     },
    //   },
    //   {
    //     $sort: {
    //       distance: 1,
    //     },
    //   },
    //   {
    //     $project: {
    //       password: 0,
    //       userId: 0,
    //       "orders.restu": 0,
    //       "orders.mrp": 0,
    //       "orders.discount": 0,
    //       "orders.tax": 0,
    //       "orders.token": 0,
    //       "orders.status": 0,
    //       OrderTokne: 0,
    //       creatdAt: 0,
    //       // distance: 0,
    //     },
    //   },
    // ]);


    const orders = await Order.findOne({
      deliveryBoyId: req.delBoy._id,
      isDbAccept: false
    }).populate({
      path: "userId",
      select: 'username'
    }).populate({
      path: 'orders.restu.resId',
      select: 'resName resAddress resLatLong'
    }).select("-password ")

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.dbUpdateLiveLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Don't have lat and long",
      });
    }

    const delBoy = await DelBoy.findById(req.delBoy._id);

    if (!delBoy) {
      return res.status(400).json({
        success: false,
        message: "something Went Wrong",
      });
    }

    if (delBoy.active === false) {
      return res.status(400).json({
        success: false,
        message: "Db not active",
      });
    }

    if (delBoy?.dbCurrentLoc?.coordinates?.length !== 2) {
      delBoy.dbCurrentLoc.coordinates = [longitude, latitude];
      await delBoy.save();
      return res.status(200).json({
        success: true,
        message: "Location Upadeted",
      });
    } else if (
      delBoy?.dbCurrentLoc?.coordinates[0] === longitude &&
      delBoy?.dbCurrentLoc?.coordinates[1] === latitude
    ) {
      return res.status(200).json({
        success: false,
        message: "No Need To Update Location",
      });
    }

    delBoy.dbCurrentLoc.coordinates = [longitude, latitude];
    await delBoy.save();

    return res.status(200).json({
      success: true,
      message: "Location Upadeted",
    });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.dbAcceptOrder = async (req, res) => {
  try {

    const { ordId } = req.params;

    if (!ordId) {
      return res.state(400).json({
        success: false,
        message: "Please Give Ord Id",
      });
    }

    const order = await Order.findById(ordId)

    if(!order){
      return res.status(200).json({
        success: false,
        message: "Order Not Found"
      })
    }

    if(order?.isDbAccept === true){
      return res.status(200).json({
        success: false,
        message: "Order Already Accepted"
      })
    }

    order.isDbAccept = true
    order.status = "on way"

    await order.save()

    return res.status(200).json({
      success:  true,
      message: "Order Accepted"
    })

  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.dbMyActiveOrder = async (req, res) => {
  try {

    const order = await Order.findOne({deliveryBoyId: req.delBoy._id, status: "on way"}).populate({
      path: 'orders.restu.resId',
      select: 'resName resAddress resLatLong'
    })

    if(!order){
      return res.status(400).json({
        success: false,
        message: "Order Not Found"
      })
    }

    return res.status(200).json({
      success: true,
      order
    })

  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.dbUpdateResStatus = async (req, res) => {
  try {
    const {ordId, resId} = req.body;

    const order = await Order.findById(ordId).populate({
      path: 'orders.restu.resId',
      select: 'resName resAddress resLatLong'
    })

    if(!order){
      return res.status(400).json({
        success: false,
        message: "Order Not Found"
      })
    }

    for(let i=0; i<order?.orders?.restu.length; i++){
      if(resId.toString() == order.orders.restu[i].resId._id.toString()){
        order.orders.restu[i].resStatus = "on way"
      }
    }

    await order.save()
    return res.status(200).json({
      success: true,
      message: "Status Updated"
    })

  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.dbActiveDeactive = async (req, res) => {
  try {
    const delBoy = await DelBoy.findById(req.delBoy._id)

    const order = await Order.findOne({deliveryBoyId: delBoy._id, status: { $ne: "delivered" }})

    if(order){
      return res.status(400).json({
        success: false,
        message: "first complate your order"
      })
    }

    if(delBoy?.active){
      delBoy.active = false
    } else {
      delBoy.active = true
    }

    await delBoy.save();

    return res.status(200).json({
      success: true,
      message: "Updated"
    })

  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.dbDeliverdOrder = async (req, res) => {
try {

  const { ordId } = req.params;

  if(!ordId){
    return res.status(400).json({
      success: false,
      message: "Ordid not found"
    })
  }

  const delBoy = await DelBoy.findById(req.delBoy._id)
  const order = await Order.findById(req.params.ordId)

  if(!order){
    return res.status(400).json({
      success: false,
      message: "Order Not FOund"
    })
  }

  if(order.payMode === "Cod"){
    order.isPay = true
    delBoy.money -= order?.orders?.total
  } else {
    delBoy.money += order?.orders?.deliveryCharg
  }

  order.status = "delivered"
  await order.save()

  

  delBoy.isAvilable = true
  await delBoy.save()

  return res.status(200).json({
    success: true,
    message: "Orderd Delivered Successfully"
  })

} catch (error) {
  console.log("Catch Error" + error);
  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
}


exports.dbDashCharts = async (req, res) => {
  try {
    let topTwoCart = {};
    let pieChart = {};

    const today = new Date();
    var previousDate = new Date(today);
    previousDate.setDate(today.getDate() - 1);

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
      deliveryBoyId: req.delBoy._id,
      creatdAt: {
        $gt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() 
        ).setHours(0,0,0),
        $lt: today,
      },
    });

    const lastOrder = await Order.find({
      deliveryBoyId: req.delBoy._id,
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

    let todayIncome = 0;
    let lastDayIncome = 0;

    for (let i = 0; i < todayOrder.length; i++) {
      todayIncome += todayOrder[i]?.orders?.deliveryCharg
    }

    for (let i = 0; i < lastOrder.length; i++) {
      lastDayIncome += lastOrder[i]?.orders?.deliveryCharg
    }

    const totalOrder = await Order.countDocuments({
      deliveryBoyId: req.delBoy._id,
    })

    const totalCodOrder = await Order.countDocuments({
      deliveryBoyId: req.delBoy._id,
      payMode: "Cod"
    })

    const totalOnlineOrder = await Order.countDocuments({
      deliveryBoyId: req.delBoy._id,
      payMode: "Online"
    })

    const totalAcceptOrder = await Order.countDocuments({
      deliveryBoyId: req.delBoy._id,
      isDbAccept: true
    })

    const todayOrderPercent = calculatePercentage(
      todayOrder.length,
      lastOrder.length
    );

    const todayIncomePercent = calculatePercentage(todayIncome, lastDayIncome);
    const totalCodOrderPercent = picChartPercentage(totalCodOrder, totalOrder)
    const totalOnlineOrderPercent = picChartPercentage(totalOnlineOrder, totalOrder)
    const totalAcceptOrderPercent = picChartPercentage(totalAcceptOrder, totalOrder)

    topTwoCart = {
      todayOrder: {
        count: todayOrder.length,
        percentage: todayOrderPercent,
      },
      todayIncome: {
        count: todayIncome,
        percentage: todayIncomePercent,
      },
    };


    pieChart = {
      totalCodOrder: {
        count: totalCodOrder,
        percentage: totalCodOrderPercent,
      },
      totalOnlineOrder: {
        count: totalOnlineOrder,
        percentage: totalOnlineOrderPercent,
      },
      totalAcceptOrder: {
        count: totalAcceptOrder,
        percentage: totalAcceptOrderPercent,
      },
    };

    const orderedDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const areaChart = [];
    for (let i = 0; i < orderedDays.length; i++) {
      const order = await Order.find({
        deliveryBoyId: req.delBoy._id,
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
    }

    console.log("return")
    return res.status(200).json({
      success: true,
      topTwoCart,
      pieChart,
      areaChart,
    });
    
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};