const User = require('../model/User')
const { sendMail } = require('../utils/sendMail')

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

        user = await User.findOne({phone})
        if(user){
            return res.status(400).json({success:false, message:"Already Used Phone Number"})
        }

        otp = Math.floor((Math.random()*1000000)+1);
        otp_expired  = new Date(Date.now() + 5 * 60 * 1000)

        const newUser = await User.create({
            username,phone,email,password,otp,otp_expired
        })

        const sendUser = {
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone,
            verify: newUser.verify
        }

        
        const token = await newUser.CreateToken()

        await sendMail(email, "Veryfy Your Account On Swigy", `Your OTP Is ${otp}`)

        return res.status(201).cookie("token",token, {httpOnly:true}).json({
            sendUser,token,success:true
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
        console.log("login")
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

        if(user.otp !== otp || user.otp_expired < Date.now()){
            return res.status(400).json({success: false, message:"OTP DOn't Match And expired"})
        }

        user.otp = null
        user.otp_expired = null
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