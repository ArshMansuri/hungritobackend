const DelBoy = require("../model/DelBoy");
const Order = require("../model/Order");
const { sendMail } = require("../utils/sendMail");
const { sendOtp } = require("../utils/sendOtp");
const cloudinary = require("cloudinary");

exports.dbFirstSignUp = async (req, res) => {
  try {
    const { dbEmail } = req.body;

    const dBoy = await DelBoy.findOne({ "dbEmail.email": dbEmail });
    if (dBoy) {
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

exports.loadDb = async (req, res) => {
  try {
    const delBoy = await DelBoy.findById(req.delBoy._id);
    return res.status(200).json({ success: true, delBoy });
  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDbNewOrders = async (req, res) => {
  try {

    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(404).json({
        success: false,
        message: "Don't have your loaction",
      });
    }

    const orders = await Order.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: 5000,
          spherical: true,
        },
      },
      {
        $match: {
          status: "res accept",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                username: "$username",
              },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "restaurants",
          localField: "orders.restu.resId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                resName: "$resName",
                resAddress: "$resAddress",
                resLatLong: "$resLatLong",
              },
            },
          ],
          as: "restaurantAddresses",
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
      {
        $project: {
          password: 0,
          userId: 0,
          "orders.restu": 0,
          "orders.mrp": 0,
          "orders.discount": 0,
          "orders.tax": 0,
          "orders.token": 0,
          "orders.status": 0,
          OrderTokne: 0,
          creatdAt: 0,
          // distance: 0,
        },
      },
    ]);

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
