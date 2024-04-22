const Admin = require("../model/Admin");
const Restaurant = require("../model/Restaurant");
const DelBoy = require("../model/DelBoy");
const ResType = require("../model/Restype");
const { calculatePercentage, picChartPercentage } = require("../utils/helper/helper");
const Order = require("../model/Order");
const User = require("../model/User");
const Filter = require("../model/Filter");
const { firebase } = require("../firebase/index")

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

exports.adminLogout = async (req, res) => {
  try {
    return res.status(200).cookie("admintoken", null, {
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
    const restus = await Restaurant.find({isVerify: true}).select(
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
    const delBoys = await DelBoy.find({isVerify: true}).select(
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
    const restus = await Restaurant.find({isVerify: false, "resFoodImage.publicUrl": {
      $ne: null
    }}).select(
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
      "resName resCompletAddress.city resAddress resPhone.phone resOwnerName money"
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

    let restu = await Restaurant.findById({_id: resId})

    if(!restu && restu?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    restu = await Restaurant.deleteOne({_id: resId})
    // await restu.remove()

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
    const delBoys = await DelBoy.find({isVerify: false, "dbImage.publicUrl": {
      $ne: null
    }}).select(
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
      "dbName dbCompletAddress.city dbAddress dbImage.publicUrl dbVihicalImage.publicUrl dbLicenseImage.publicUrl dbPhone.phone money"
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

    let delBoy = await DelBoy.findById(dbId)

    if(!delBoy && delBoy?.isVerify === true){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    delBoy = await DelBoy.deleteOne({_id: dbId})


    // await delBoy.remove()

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

exports.adminSendResEarnMoney = async (req, res) => {
  try {

    const {resId} = req.params
    const {ammount} = req.body

    const admin = await Admin.findById(req.admin._id)
    console.log(ammount)
    if(admin.email !== "admin@gmail.com"){
      return res.status(400).json({
        success: false,
        message: "You Can't Update Money",
      });
    }

    if(!ammount || !resId){
      return res.status(400).json({
        success: false,
        message: "Enter All Detail",
      });
    }

    const restu = await Restaurant.findById(resId)

    if(!restu){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    restu.money -= Number.parseInt(ammount)
    admin.money -= Number.parseInt(ammount)

    await restu.save()
    await admin.save()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Money Send Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.adminSendDbEarnMoney = async (req, res) => {
  try {

    const {dbId} = req.params
    const {ammount} = req.body

    const admin = await Admin.findById(req.admin._id)
    if(admin.email !== "admin@gmail.com"){
      console.log("inn")
      return res.status(400).json({
        success: false,
        message: "You Can't Update Money",
      });
    }


    if(!ammount || !dbId){
      return res.status(400).json({
        success: false,
        message: "Enter All Detail",
      });
    }

    const delBoy = await DelBoy.findById(dbId)

    if(!delBoy){
      return res.status(400).json({
        success: false,
        message: "Delivery Boy Not Available",
      });
    }

    delBoy.money -= Number.parseInt(ammount)
    admin.money -= Number.parseInt(ammount)

    await delBoy.save()
    await admin.save()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Money Send Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.adminReceiveResMoney = async (req, res) => {
  try {

    const {resId} = req.params
    const {ammount} = req.body

    const admin = await Admin.findById(req.admin._id)
    if(admin.email !== "admin@gmail.com"){
      console.log("inn")
      return res.status(400).json({
        success: false,
        message: "You Can't Update Money",
      });
    }

    if(!ammount || !resId){
      return res.status(400).json({
        success: false,
        message: "Enter All Detail",
      });
    }

    const restu = await Restaurant.findById(resId)

    if(!restu){
      return res.status(400).json({
        success: false,
        message: "Restaurant Not Available",
      });
    }

    restu.money += Number.parseInt(ammount)
    admin.money += Number.parseInt(ammount)

    await restu.save()
    await admin.save()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Money Send Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.adminReceiveDbMoney = async (req, res) => {
  try {

    const {dbId} = req.params
    const {ammount} = req.body

    const admin = await Admin.findById(req.admin._id)
    if(admin.email !== "admin@gmail.com"){
      console.log("inn")
      return res.status(400).json({
        success: false,
        message: "You Can't Update Money",
      });
    }


    if(!ammount || !dbId){
      return res.status(400).json({
        success: false,
        message: "Enter All Detail",
      });
    }

    const delBoy = await DelBoy.findById(dbId)

    if(!delBoy){
      return res.status(400).json({
        success: false,
        message: "Delivery Boy Not Available",
      });
    }

    delBoy.money += Number.parseInt(ammount)
    admin.money += Number.parseInt(ammount)

    await delBoy.save()
    await admin.save()

    // send mail to restaurant

    return res.status(200).json({
      success: true,
      message: "Money Send Successfully",
    });

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsersList = async (req, res) => {
  try {
    const users = await User.find()

    return res.status(200).json({
      users,
      success: true
    })


  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getReturnPaymentOrdersList = async (req, res) => {
  try {

    const orders = await Order.find({
      status: {
        $in: ["cancel by user", "cancel by res"],
      },
      payMode: "Online",
      isPay: true
    }).populate({path: "userId", select: "username profilImg phone.phone"}).select("OrderTokne orders.total")

    return res.status(200).json({
      orders,
      success: true
    })


  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.adminReturnOrderPayment = async (req, res) => {
  try {
    const {ordId} = req.body

    if(!ordId){
      return res.status(400).json({
        success: false,
        message: "OrdId Not Available",
      });
    }

    const admin = await Admin.findById(req.admin._id)
    if(admin.email !== "admin@gmail.com"){
      return res.status(400).json({
        success: false,
        message: "You Can't Update Money",
      });
    }

    const order = await Order.findById(ordId)

    if(!order){
      return res.status(400).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if(order?.status === "cancel by user" || order?.status === "cancel by res"){
      order.status = "payment returned"
      admin.money -= order?.orders?.total

      await order.save()
      await admin.save()

      return res.status(200).json({
        success: true,
        message: "Payment Return Successfully",
      }); 

    } else {
      return res.status(400).json({
        success: false,
        message: "Somthing Went Wrong",
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


exports.adminAddFilter = async (req, res) => {
  try {

    const {type, name, access} = req.body

    if(!type || !name){
      return res.status(400).json({
        success: false,
        message: "Enter All detail",
      });
    }

    if(access){
      const filter = Filter.create({
        type, name, access
      })
    } else{
      const filter = Filter.create({
        type, name
      })
    }


    return res.status(200).json({
      success: true,
      message: "Filter Created"
    })

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.adminSendNotificationToUser = async (req, res) => {
  try {
    const {tital, body} = req.body
    
    if(!tital || !body){
      return res.status(400).json({
        success: false,
        message: "Enter All detail",
      });
    }
    let tempTital = tital
    let tempBody = body

    const users = await User.find({notiTokne: {
      $ne: "not allow"
    }})

    for(let i=0; i<users?.length; i++){
      if(users[i]?.notiTokne !== undefined || users[i]?.notiTokne !== "not allow"){
        if(tital.includes("<<username>>")){
          tempTital = tital.replace("<<username>>", users[i]?.username)
        }
        if(body.includes("<<username>>")){
          tempBody = body.replace("<<username>>", users[i]?.username)
        }

        await firebase.messaging().send({
          token: users[i].notiToken,
          notification:{
              title: tempTital,
              body: tempBody
          }
        })

      }
    }

    return res.status(200).json({
      success: true,
      message: "Notification send successfully"
    })

  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.adminDashCharts = async (req, res) => {
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
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt: {
        $gt: previousDate,
        $lt: today,
      },
    });

    const lastOrder = await Order.find({
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

    const todayUser = await User.find({
      creatdAt: {
        $gt: previousDate,
        $lt: today,
      },
    });

    const lastUser = await User.find({
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
    })

    let todayIncome = 0;
    let lastDayIncome = 0;

    for (let i = 0; i < todayOrder.length; i++) {
      todayIncome += todayOrder[i]?.orders?.total
    }

    for (let i = 0; i < lastOrder.length; i++) {
      lastDayIncome += lastOrder[i]?.orders?.total
    }

    const thisMonthOrder = await Order.find({
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt: {
        $gt: thisMonth.start,
        $lt: thisMonth.end,
      },
    });

    const lastMonthOrder = await Order.find({
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
      console.log(thisMonthOrder[i]?.orders?.total)
      thisMonthIncome += thisMonthOrder[i]?.orders?.total || 0
    }
    console.log(thisMonthIncome, " totalllll")

    for (let i = 0; i < lastMonthOrder.length; i++) {
      lastMontIncome += lastMonthOrder[i]?.orders?.total
    }

    const totalUser = await User.countDocuments({
      verify: true
    })
    const totalRes = await Restaurant.countDocuments({
      isVerify: true
    })
    const totalDb = await DelBoy.countDocuments({
      isVerify: true
    })
    const totalUserResDb = totalUser +  totalRes + totalDb

    const todayOrderPercent = calculatePercentage(
      todayOrder.length,
      lastOrder.length
    );
    const todayUserPercent = calculatePercentage(
      todayUser.length,
      lastUser.length
    );

    const todayIncomePercent = calculatePercentage(todayIncome, lastDayIncome);
    const thisMonthIncomePercent = calculatePercentage(
      thisMonthIncome,
      lastMontIncome
    );
    const totalUserPercent = picChartPercentage(totalUser, totalUserResDb)
    const totalResPercent = picChartPercentage(totalRes, totalUserResDb)
    const totalDbPercent = picChartPercentage(totalDb, totalUserResDb)


    topFourCart = {
      todayOrder: {
        count: todayOrder.length,
        percentage: todayOrderPercent,
      },
      todayUser: {
        count: todayUser.length,
        percentage: todayUserPercent,
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
      totalUser: {
        count: totalUser,
        percentage: totalUserPercent,
      },
      totalRes: {
        count: totalRes,
        percentage: totalResPercent,
      },
      totalDb: {
        count: totalDb,
        percentage: totalDbPercent,
      },
    };

    const orderedDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const areaChart = [];
    const weekRevenueChart = [];
    for (let i = 0; i < orderedDays.length; i++) {
      const order = await Order.find({
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
          income += o?.orders?.total
      })
      weekRevenueChart.push(income)
    }

    const thisYearRevenue = new Array(12).fill(0)
    const lastYearRevenue = new Array(12).fill(0)
    const thisYearOrder = await Order.find({
      status: {
        $nin: ["cancel by user", "cancel by res"]
      },
      creatdAt:{
        $gt: new Date(today.getFullYear(), 0, 1),
        $lt: today
      }
    })

    const lastYearOrder = await Order.find({
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
      // const resIndex = order?.orders.restu?.findIndex(obj=> obj.resId.toString() === req.restu._id.toString())
      // if(resIndex !== -1){
        thisYearRevenue[creationDate.getMonth()] += order?.orders?.total || 0
      // }
    })

    lastYearOrder.forEach((order)=>{
      const creationDate = order?.creatdAt
      // const resIndex = order?.orders.restu?.findIndex(obj=> obj.resId.toString() === req.restu._id.toString())
      // if(resIndex !== -1){
        lastYearRevenue[creationDate.getMonth()] += order?.orders?.total || 0
      // }
    })

    return res.status(200).json({
      success: true,
      topFourCart,
      pieChart,
      areaChart,
      thisYearRevenue,
      lastYearRevenue,
      weekRevenueChart
    });

  } catch (error) {
    console.log("Catch Error" + error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};