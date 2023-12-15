const Restaurant = require("../model/Restaurant")
const { sendMail } = require("../utils/sendMail")
const { sendOtp } = require("../utils/sendOtp")
const cloudinary = require("cloudinary")

exports.resFirstSignUp = async (req, res) => {
  try {
    const { resEmail,} = req.body;

    const restu = await Restaurant.findOne({ "resEmail.email": resEmail });

    if (restu) {
      return res.status(500).json({
        success: false,
        message: "Email Already Used",
      });
    }

    otp = Math.floor(Math.random() * 9000) + 1000;
    otp_expired = new Date(Date.now() + 5 * 60 * 1000);

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
        isVerify:false
      }
    };

    const token = await newRestu.CreateToken();

    await sendMail(
      resEmail,
      "Veryfy Your Restaurant Account On HungriTo",
      `Your OTP Is ${otp}`
    );

    return res.status(201).cookie("token", token, { httpOnly: true }).json({
      sendUser,
      success: true,
    });
  } catch (error) {
    console.log('Catch Error:: ', error)
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
    console.log('Catch Error:: ', error)
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
    restu.resPhone.otp_expired = new Date(Date.now() + 5 * 60 * 1000);
    restu.resPhone.otp = otp;
    const msg = `Your HungriTo OTP Is ${otp}`;
    sendOtp(phone, msg);
    await restu.save();

    return res.status(200).json({
      success: true,
      message: `OTP Send On Number ${phone}`,
    });
  } catch (error) {
    console.log('Catch Error:: ', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resPhoneVerify = async (req, res) => {
  try {
    const { otp, phone } = req.body;
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
    console.log('Catch Error:: ', error)
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
    restu.resOwnerPhone.otp_expired = new Date(Date.now() + 5 * 60 * 1000);
    restu.resOwnerPhone.otp = otp;
    const msg = `Your HungriTo OTP Is ${otp}`;
    sendOtp(phone, msg);
    await restu.save();

    return res.status(200).json({
      success: true,
      message: `OTP Send On Number ${phone}`,
    });
  } catch (error) {
    console.log('Catch Error:: ', error)
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
    console.log('Catch Error:: ', error)
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
      (!resName || !resAddress || !address,
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
    restu.resAddress = resAddress;
    restu.resCompletAddress.address = address;
    restu.resCompletAddress.country = country;
    restu.resCompletAddress.state = state;
    restu.resCompletAddress.city = city;
    restu.resCompletAddress.pincode = pincode;
    restu.resCompletAddress.latitude = latitude;
    restu.resCompletAddress.longitude = longitude;
    restu.resPhone.phone = resPhone;
    restu.resOwnerPhone.phone = resOwnerPhone;
    restu.resOwnerEmail.email = resOwnerEmail;
    restu.resOwnerName = resOwnerName;

    await restu.save();

    return res.status(200).json({
      success: true,
      message: "Save Successfully",
    });

  } catch (error) {
    console.log('Catch Error:: ', error)
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
      resFoodType,
      resTime,
      sun,
      mon,
      tues,
      wed,
      thurs,
      fri,
      sat,
    } = req.body;
    console.log(req.body)
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
      resFoodType.length !== 2 ||
      resFoodType === undefined
    ) {
      res.status(400)
      .json({ success: false, message: "Enter All Fild" });
    }

    const restu = await Restaurant.findById(req.restu._id)

    restu.resType = resType
    restu.resFoodType = resFoodType

    // console.log(resTime)
    // for(let i=0; i<resTime.length; i++){
    //   console.log(resTime[i].endTime, "iiiiiiiiiiiiiiiiiii")
    //   restu.resTime[i].startTime = resTime[i]?.startTime
    //   restu.resTime[i].endTime = resTime[i]?.endTime

    // }

    restu.resTime = resTime

    restu.resOpenDays.sun = sun
    restu.resOpenDays.mon = mon
    restu.resOpenDays.thurs = thurs
    restu.resOpenDays.wed = wed
    restu.resOpenDays.thurs = thurs
    restu.resOpenDays.fri = fri
    restu.resOpenDays.sat = sat

    await restu.save()

    return res.status(200).json({
      success: true,
      message: "Save Successfully",
    });

  } catch (error) {
    console.log('Catch Error:: ', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resLastSignUp = async(req, res)=>{
  try {
    
    const {img, isOffer, offer} = req.body

    if(!img || isOffer === undefined){
      return res.status(400)
      .json({ success: false, message: "Enter All Fild" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(img, {
      folder: "hungriTo/restaurant"
    })

    const restu = await Restaurant.findById(req.restu._id)

    restu.resFoodImage.publicUrl = myCloud.secure_url
    restu.resFoodImage.publicId = myCloud.public_id

    restu.resOffer.isOffer = isOffer
    if(isOffer){
      restu.resOffer.offer = offer
    }

    await restu.save()
    return res.status(200).json({
      success: true,
      message: "Save Successfully",
    });

  } catch (error) {
    console.log("Catch Error" + error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.resLogin = async(req, res)=>{
  try {

    const {phone, pass} = req.body

    const restu = await Restaurant.findOne({ "resPhone.phone": phone})

    if(!restu){
      return res.status(400).json({
        success: false,
        message: "Invalide Details"
      })
    }

    if(restu.isVerify === false || restu.password !== pass){
      return res.status(400).json({
        success: false,
        message: "Invalide Details"
      })
    }

    const token = await restu.CreateToken();

    return res.status(200).cookie("token", token, { httpOnly: true }).json({
      success: true,
      message: "Login Successfully"
    })
    
  } catch (error) {
    console.log("Catch Error" + error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
