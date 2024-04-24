const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')


const DelBoySchema = mongoose.Schema({
    dbName: String,
    dbAddress:{
        type: String
    },

    dbCompletAddress:{
        address:{
            type: String
        },
        country:{
            type: String
        },
        state:{
            type: String
        },
        city:{
            type: String
        },
        pincode:{
            type: Number
        }
    },

    dbLatLong:{
        type:{
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },

    dbPhone:{
        phone:{
            type: String,
            // unique: true
        },
        otp: Number,
        otp_expired: Date,
        isVerify:{
            type: Boolean,
            default: false
        }
    },

    dbEmail:{
        email:{
            type: String
        },
        otp: Number,
        otp_expired: Date,
        isVerify:{
            type: Boolean,
            default: false
        }
    },

    dbImage:{
        publicId: String,
        publicUrl: String
    },  

    dbVihicalImage:{
        publicId: String,
        publicUrl: String
    },  
    
    dbLicenseImage:{
        publicId: String,
        publicUrl: String
    },  

    active:{
        type: Boolean,
        default: false
    },

    isAvilable: {
        type: Boolean,
        default: false
    },
    
    isVerify:{
        type: Boolean,
        default: false
    },

    dbCurrentLoc: {
        type:{
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },

    password: {
        type: String,
        select: false
    },

    money: {
        type: Number,
        default: 0
    },

    isBanned: {
        type: Boolean,
        default: false
    },

    forgotPassToken: String,
    forgotPassExpired: Date,
    
    creatdAt:{
        type: Date,
        default: Date.now
    }
})

DelBoySchema.pre("save", async function (next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
})

DelBoySchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

DelBoySchema.methods.CreateToken = async function(){
    return jwt.sign({_id: this._id},process.env.JWT)
}

DelBoySchema.methods.createForgotPassToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.forgotPassToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.forgotPassExpired = Date.now() +  10 * 60 * 1000
    console.log(resetToken)
    console.log(this.forgotPassToken)
    return resetToken
}

DelBoySchema.index({"dbEmail.otp_expired": 1}, {expireAfterSeconds: 0})

module.exports = mongoose.model("DelBoy", DelBoySchema)