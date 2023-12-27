const Admin = require('../model/Admin');
const Restaurant = require('../model/Restaurant');
const ResType = require('../model/Restype')

exports.adminLogin = async(req,res)=>{
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Enter all filds"
            })
        }

        const admin = await Admin.findOne({'email':email}).select("+password")

        if(!admin){
            return res.status(400).json({
                success: false,
                message: "Invalid detail"
            })
        }

        if(!admin.isActive){
            return res.status(400).json({
                success: false,
                message: "Inactive Admin"
            })
        }

        const isMatch = await admin.matchPassword(password)
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Invalid detail"
            })
        }

        const admintoken = await admin.CreateToken()

        const sendAdmin = {
            email: admin.email,
            isActive: admin.isActive
        }

        return res.status(200).cookie("admintoken",admintoken, {httpOnly:true, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), sameSite: 'None', secure: true }).json({
            success: true,
            message: "Login successfully",
            admin:sendAdmin,
            admintoken
        })
        
    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.makeAdmin = async(req,res)=>{
    const {email,password} = req.body;
    const isActive = true
    const admin = await Admin.create({
        email,password,isActive:true
    })
    return res.status(201).json({success: true, admin})
}

exports.makeResPortal = async(req, res)=>{
    try {
        const {resId} = req.body;

        if(!resId){
            return res.status(400).json({
                success: false,
                message: "Not Have resId"
            })
        }

        const restu = await Restaurant.findById(resId)
        if(!restu){
            return res.status(400).json({
                success: false,
                message: "Resturant Not Available"
            })
        }

        if(restu.isVerify){
            return res.status(400).json({
                success: false,
                message: "Already Verifyed"
            })
        }

        restu.isVerify = true
        await restu.save()

        return res.status(200).json({success: true, message: 'Resturant verifyed successfully'})

    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.addResType = async(req, res)=>{
    try {
        
    } catch (error) {
        
    }
}
exports.addResFoodType = async(req, res)=>{
    try {
        
    } catch (error) {
        
    }
}