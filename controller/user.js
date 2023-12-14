const User = require('../model/User')
const { sendMail } = require('../utils/sendMail')
const { sendOtp } = require('../utils/sendOtp')

exports.userSignUp = async(req, res)=>{
    try {

        const {username,email,phone,password} = req.body

        if(!username || !email || !phone || !password){
            return res.status(400).json({success:false, message:"Enter All Fild"})
        }

        let user = await User.findOne({email})
        if(user){
            return res.status(400).json({success:false, message:"Already Used Email"})
        }

        user = await User.findOne({"phone.phone": phone})
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

        const newUser = await User.create({
            username,phone:phoneObj,email,password
        })

        const sendUser = {
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone.phone,
            verify: newUser.verify
        }

        
        const token = await newUser.CreateToken()

        //temp phone = ""
        sendOtp("+919574478944", `Veryfy Your Account On HUNGRITO Your OTP Is ${otp}`)

        return res.status(201).cookie("token",token, {httpOnly:true}).json({
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

        return res.status(200).cookie("token",token, {httpOnly:true}).json({
            user,token,success:true
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

        const {otp} = req.body
        if(!otp){
            return res.status(400).json({message:"Enter OPT"})
        }

        const user = await User.findById(req.user._id)

        if(user.phone.otp !== otp || user.phone.otp_expired < Date.now()){
            return res.status(400).json({success: false, message:"OTP DOn't Match And expired"})
        }

        user.phone.otp = null
        user.phone.otp_expired = null
        user.phone.isVerify = true
        user.verify = true

        await user.save()

        return res.status(200).json({success: true, message: "SignUp Successfully"})
        
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