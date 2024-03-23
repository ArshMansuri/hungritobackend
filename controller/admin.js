const Admin = require("../model/Admin");
const Restaurant = require("../model/Restaurant");
const DelBoy = require("../model/DelBoy");
const ResType = require("../model/Restype");

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter all filds",
      });
    }

    const admin = await Admin.findOne({ email: email }).select("+password");
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid detail",
      });
    }

    if (!admin.isActive) {
      return res.status(400).json({
        success: false,
        message: "Inactive Admin",
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid detail",
      });
    }

    const admintoken = await admin.CreateToken();

    const sendAdmin = {
      email: admin.email,
      isActive: admin.isActive,
    };

    return res
      .status(200)
      .cookie("admintoken", admintoken, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sameSite: "None",
        secure: true,
      })
      .json({
        success: true,
        message: "Login successfully",
        admin: sendAdmin,
        admintoken,
      });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.loadAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    return res.status(200).json({ success: true, admin });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isActive = true;
    const admin = await Admin.create({
      email,
      password,
      isActive: true,
    });
    return res.status(201).json({ success: true, admin });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.makeResPortal = async (req, res) => {
  try {
    const { resId } = req.body;

    if (!resId) {
      return res.status(400).json({
        success: false,
        message: "Not Have resId",
      });
    }

    const restu = await Restaurant.findById(resId);
    if (!restu) {
      return res.status(400).json({
        success: false,
        message: "Resturant Not Available",
      });
    }

    if (restu.isVerify) {
      return res.status(400).json({
        success: false,
        message: "Already Verifyed",
      });
    }

    restu.isVerify = true;
    await restu.save();

    return res
      .status(200)
      .json({ success: true, message: "Resturant verifyed successfully" });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addResType = async (req, res) => {
  try {
  } catch (error) {}
};
exports.addResFoodType = async (req, res) => {
  try {
  } catch (error) {}
};

exports.getAllResList = async (req, res) => {
  try {
    const restus = await Restaurant.find().select(
      "resName resCompletAddress.city active money"
    );

    return res.status(200).json({
      success: true,
      restus,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDbList = async (req, res) => {
  try {
    const delBoys = await DelBoy.find().select(
      "dbName dbCompletAddress.city isBanned money dbImage.publicUrl"
    );

    return res.status(200).json({
      success: true,
      delBoys,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resActiveInActive = async (req, res) => {
  try {
    const { resId } = req.params;

    if (!resId) {
      return res.status(400).json({
        success: false,
        message: "ResId Not Available",
      });
    }

    const restu = await Restaurant.findById(resId);

    if (!restu) {
      return res.status(400).json({
        success: false,
        message: "Resturant Not Available",
      });
    }

    if(restu?.active){
        restu.active = false
    } else {
        restu.active = true
    }

    await restu.save()

    return res.status(200).json({
        success: true,
        message: "Resturant Detail Updated"
    })

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.dbBannedUnBanned = async (req, res) => {
  try {
    const { dbId } = req.params;

    if (!dbId) {
      return res.status(400).json({
        success: false,
        message: "dbId Not Available",
      });
    }

    const del = await DelBoy.findById(dbId);

    if (!del) {
      return res.status(400).json({
        success: false,
        message: "Delivery Not Available",
      });
    }

    if(del?.isBanned){
      del.isBanned = false
    } else {
      del.isBanned = true
    }

    await del.save()

    return res.status(200).json({
        success: true,
        message: "Delivery Boy Detail Updated"
    })

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllNewResList = async (req, res) => {
  try {
    const restus = await Restaurant.find({isVerify: false}).select(
      "resName resCompletAddress.city money"
    );

    return res.status(200).json({
      success: true,
      restus,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDetailNewRes = async (req, res) => {
  try {

    const {resId} = req.params

    const restu = await Restaurant.findById(resId).select(
      "resName resCompletAddress.city resAddress resPhone.phone resOwnerName"
    );

    if(!restu && restu?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    return res.status(200).json({
      success: true,
      restu,
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.adminAcceptRes = async (req, res) => {
  try {

    const {resId} = req.params

    const restu = await Restaurant.findById(resId)

    if(!restu && restu?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    restu.isVerify = true
    await restu.save()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Accept Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.adminRejectRes = async (req, res) => {
  try {

    const {resId} = req.params

    const restu = await Restaurant.findById(resId)

    if(!restu && restu?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    await restu.remove()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Reject Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllNewDbList = async (req, res) => {
  try {
    const delBoys = await DelBoy.find({isVerify: false}).select(
      "dbName dbCompletAddress.city money dbImage.publicUrl"
    );

    return res.status(200).json({
      success: true,
      delBoys,
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDetailNewdb = async (req, res) => {
  try {

    const {dbId} = req.params

    const delBoy = await DelBoy.findById(dbId).select(
      "dbName dbCompletAddress.city dbAddress dbImage.publicUrl dbVihicalImage.publicUrl dbLicenseImage.publicUrl dbPhone.phone"
    );

    if(!delBoy && delBoy?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    return res.status(200).json({
      success: true,
      delBoy,
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.adminAcceptDb = async (req, res) => {
  try {

    const {dbId} = req.params

    const delBoy = await DelBoy.findById(dbId)

    if(!delBoy && delBoy?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Delivery Boy Not Available",
      });
    }

    delBoy.isVerify = true
    await delBoy.save()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Accept Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.adminRejectDb = async (req, res) => {
  try {

    const {dbId} = req.params

    const delBoy = await DelBoy.findById(dbId)

    if(!delBoy && delBoy?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    await delBoy.remove()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Reject Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
