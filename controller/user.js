const Restaurant = require('../model/Restaurant')
const User = require('../model/User')
const { sendOtp } = require('../utils/sendOtp')
const cloudinary = require("cloudinary")

exports.userSignUp = async(req, res)=>{
    try {

        const {username,phone,password,img} = req.body

        if(!username || !phone || !password){
            return res.status(400).json({success:false, message:"Enter All Fild"})
        }

        let user = await User.findOne({"phone.phone": phone})
        if(user){
            return res.status(400).json({success:false, message:"Already Used Phone Number"})
        }

        otp = Math.floor(Math.random() * 9000) + 1000;
        otp_expired  = new Date(Date.now() + 5 * 60 * 1000)

        const phoneObj = {
            phone: phone,
            otp: otp,
            otp_expired: otp_expired
        }

        let newUser = {}
        if(img){
            const myCloud = await cloudinary.v2.uploader.upload(img, {
                folder: "hungriTo/userAvatar"
            })
            profilImg = myCloud.secure_url
            newUser = await User.create({
                username,phone:phoneObj,password,profilImg
            })
        } else {
            newUser = await User.create({
                username,phone:phoneObj,password
            })
        }

        const sendUser = {
            username: newUser.username,
            phone: newUser.phone.phone,
            verify: newUser.verify,
            profilImg: newUser.profilImg
        }

        //temp phone = ""
        sendOtp("9574478944", `Veryfy Your Account On HUNGRITO Your OTP Is ${otp}`)

        return res.status(201).json({
            user:sendUser,success:true
        })

    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}

exports.userLogin = async(req, res)=>{
    try {

        const {phone, password} = req.body

        if(!phone || !password){
            return res.status(400).json({success:false, message:"Enter All Fild"})
        }

        const user = await User.findOne({'phone.phone': phone}).select("+password")

        if(!user || user.phone.isVerify === false){
            return res.status(401).json({success:false, message:"Invalid Detals"})
        }

        const isMatch = await user.matchPassword(password)

        if(!isMatch){
            return res.status(401).json({success:false, message:"Invalid Detals"})
        }

        const token = await user.CreateToken()

        let sendUser = user
        sendUser.password = ""

        return res.status(200).cookie("token",token, {httpOnly:true, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), sameSite: 'None', secure: true }).json({
            user:sendUser,token,success:true
        })

    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}

exports.userOtpVerify = async(req,res)=>{
    try {

        const {otp, phone} = req.body
        if(!otp){
            return res.status(400).json({message:"Enter OPT"})
        }

        if(!phone){
            return res.status(400).json({message:"Invalid inputs"})
        }

        const user = await User.findOne({'phone.phone': phone})
        if(!user || user.phone.isVerify === true || phone !== user.phone.phone){
            return res.status(400).json({message:"Invalid inputs"})
        }

        if(user.phone.otp !== otp || user.phone.otp_expired < Date.now()){
            return res.status(400).json({success: false, message:"OTP DOn't Match And expired"})
        }

        user.phone.otp = null
        user.phone.otp_expired = null
        user.phone.isVerify = true
        user.verify = true

        const token = await user.CreateToken()
        await user.save()
        return res.status(200).cookie("token",token, {httpOnly:true,expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ,  sameSite: 'None', secure: true }).json({success: true, message: "SignUp Successfully", token})
        
    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}

exports.loadUser = async(req, res) =>{
    try {

        const user = await User.findById(req.user._id)

        return res.status(200).json({success: true, user})

    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}

exports.getNearestRes = async(req, res)=>{
    try {
        const {longitude, latitude} = req.body
        
        if(!longitude || !latitude){
            return res.status(404).json({
                success: false,
                message: "Don't have your loaction"
            })
        }
        
        const restus = await Restaurant.find({
            resLatLong:{
                $near: {
                    $geometry: {
                      type: 'Point',
                      coordinates: [longitude, latitude],
                    },
                    $maxDistance: 15000, // in meters, corresponds to 15 km
                  },
            }
        }).populate("resCategory")

        return res.status(200).json({
            success: true,
            restus
        })

    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}

exports.getResFood = async(req, res)=>{
    try {

        const {resId} = req.params

        if(!resId){
            return res.status(401).json({
                success: false,
                message: "Don't have resId"
            })
        }

        const foods = await Restaurant.findById(resId).populate({path: 'foodList', match:{isDelete: false}})

        return res.status(200).json({
            success: true,
            foods : foods?.foodList || []
        })
        
    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}