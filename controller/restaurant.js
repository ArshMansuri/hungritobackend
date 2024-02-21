const Restaurant = require("../model/Restaurant");
const { sendMail } = require("../utils/sendMail");
const { sendOtp } = require("../utils/sendOtp");
const cloudinary = require("cloudinary");
const ResType = require("../model/Restype");
const Category = require("../model/Categories");
const Order = require("../model/Order");


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
      return res.status(400).json({ message: "Enter OPT" });
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
    restu.resLatLong.coordinates = [longitude, latitude]
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

    if(!email || !password){
      return res.status(400).json({
        success: false,
        message: "Enter all fild",
      });
    }

    const restu = await Restaurant.findOne({ "resEmail.email": email, 'isVerify': true}).select('+password')
    if (!restu) {
      return res.status(400).json({
        success: false,
        message: "Invalide Details a",
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
        restu
      });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
    const orders = await Order.find({"orders.restu.resId": req.restu._id, "orders.restu.resStatus": "pending"}).populate({path: "orders.restu.foods.foodId", select:'foodWeight'}).populate( {path: 'userId', select: 'username'})
    console.log(orders)
    if(orders[0]?.orders?.restu?.length > 1){
      const restuIndex = orders[0]?.orders?.restu?.findIndex(obj=> obj.resId.toString() === req.restu._id.toString())
      if(restuIndex !== -1){
        orders[0].orders.restu = orders[0].orders.restu.filter(e=> e.resId.toString() === req.restu._id.toString())
      }
    }

    return res.status(200).json({
      success: true,
      orders
    })
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}