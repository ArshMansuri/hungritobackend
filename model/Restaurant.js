const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')


const ResSchema = mongoose.Schema({
    resName:{
        type: String
    },

    resAddress:{
        type: String
    },

    resCompletAddress:{
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
        },
        // latitude:{
        //     type: Number
        // },
        // longitude:{
        //     type: Number
        // }
    },

    resLatLong:{
        type:{
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },

    resPhone:{
        phone:{
            type: String,
        },
        otp: Number,
        otp_expired: Date,
        isVerify:{
            type: Boolean,
            default: false
        }
    },

    resEmail:{
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

    resOwnerPhone:{
        phone:{
            type: String
        },
        otp: Number,
        otp_expired: Date,
        isVerify:{
            type: Boolean,
            default: false
        }
    },

    resOwnerName:{
        type: String
    },

    resOwnerEmail:{
        email:{
            type: String
        }
    },

    resType:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restype"
    }],

    resCategory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories"
    }],

    resTime:[{
        startTime:String,
        endTime: String 
    }],

    resOpenDays: {
        sun:{
            type: Boolean,
            default: false
        },
        mon:{
            type: Boolean,
            default: true
        },
        tues:{
            type: Boolean,
            default: true
        },
        wed:{
            type: Boolean,
            default: true
        },
        thurs:{
            type: Boolean,
            default: true
        },
        fri:{
            type: Boolean,
            default: true
        },
        sat:{
            type: Boolean,
            default: true
        },
    },

    resFoodImage:{
        publicId: String,
        publicUrl: String
    },  

    resOffer: {
        isOffer: {
            type: Boolean,
            default: false
        },
        offer:{
            type: String
        }
    },

    foodList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    }],

    active:{
        type: Boolean,
        default: false
    },
    
    isVerify:{
        type: Boolean,
        default: false
    },

    password: {
        type: String,
        select: false
    },

    resOrder: [{
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }, 
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        deliveryBoyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryBoy"
        },
        foods: Array
    }],

    money: {
        type: Number,
        default: 0
    },

    forgotPassToken: String,
    forgotPassExpired: Date,

    creatdAt:{
        type: Date,
        default: Date.now
    }

})

// ResSchema.createIndex({'resLatLong.coordinates': '2dsphere'})

ResSchema.pre("save", async function (next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
})

ResSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

ResSchema.methods.CreateToken = async function(){
    return jwt.sign({_id: this._id},process.env.JWT)
}

ResSchema.methods.createForgotPassToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.forgotPassToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.forgotPassExpired = Date.now() +  10 * 60 * 1000
    console.log(resetToken)
    console.log(this.forgotPassToken)
    return resetToken
}

ResSchema.index({resEmail:{
    otp_expired: 1
}}, {expireAfterSeconds: 0})

module.exports = mongoose.model("Restaurant", ResSchema)