const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "please enter username"],
        required: true
    },

    phone:{
      phone:{
        type: Number,
        unique: true,
        required: true,
        minlength: [10, "phone number must be 10 characters"]
      },
      otp: Number,
      otp_expired: Date,
      isVerify:{
          type: Boolean,
          default: false
      }
    },

    email:{
        type: String
    },

    password:{
        type: String,
        required: [true, "please enter password"],
        minlength: [6, "password must be at least 6 characters"],
        select: false,
        required: true
    },

    address:{
        city:{
            type: String
        },
        area:{
            type: String
        }
    },

    profilImg: {
        type: String,
        default: "https://res.cloudinary.com/dbirutg8t/image/upload/v1685538206/avatars/qmjmyxjbuysuf2vzd1ba.jpg"
    },

    otp: Number,
    otp_expired: Date,

    cart:{
        restu: [{
            resId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Restaurant'
            },
            resName: String,
            foods:[{
               foodId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Food'
               },
               foodName: String,
               foodImg: String,
               foodPrice: Number,
               foodQut: Number,
                subTotal:{
                    type: Number,
                    default: 0
                }
            }],
            resSubTotal:{
                type: Number,
                default: 0
            }
        }],
        total: {
            type: Number,
            default: 0
        }
    },

    token: {
        type: Number,
        default: 0
    },

    verify:{
        type: Boolean,
        default: false
    },

    creatdAt:{
        type: Date,
        default: Date.now
    }

})

UserSchema.pre("save", async function (next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
})

UserSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.CreateToken = async function(){
    return jwt.sign({_id: this._id},process.env.JWT)
}

UserSchema.index({"phone.otp_expired": 1}, {expireAfterSeconds: 0})

module.exports = mongoose.model("User", UserSchema)
