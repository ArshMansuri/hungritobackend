const jwt = require('jsonwebtoken')
const User = require('../model/User')
const Restaurant = require('../model/Restaurant')

exports.isUserAuth = async (req,res,next)=>{
    try {
        
        const {token} = req.cookies
        if(!token){
            return res.status(401).json({message: "Login First"})
        }

        const decoded = jwt.verify(token,process.env.JWT)
        req.user = await User.findById(decoded._id)
        next()

    } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}

exports.isRestuAuth = async(req,res,next)=>{
    try {
        
        const {restoken} = req.cookies
        if(!restoken){
            return res.status(401).json({message: "Login First"})
        }

        const decoded = jwt.verify(restoken,process.env.JWT)
        req.restu = await Restaurant.findById(decoded._id)
        next()
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}