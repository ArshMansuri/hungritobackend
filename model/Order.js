const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DelBoy'
    },

    isDbAccept: {
        type: Boolean,
        default: false
    },

    orders: {
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
            },
            isAccept:{
                type: Boolean,
                default: false
            },
            resStatus:{
                type: String,
                default: "pending"
            }
        }],
        mrp: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        deliveryCharg: {
            type: Number,
            default: 0
        },
        token: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },

    deliveryAddress: {
        latitude:{
            type: Number,
            default: 0
        },
        longitude:{
            type: Number,
            default: 0
        },
        doorFlat: String,
        landMark: String
    },

    isApplayToken: {
        type: Boolean,
        default: false
    },

    payMode: String,

    isPay: {
        type: Boolean,
        default: false
    },

    paymentToken: String,

    onlinePayTime: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        default: "new"
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

    OrderTokne: {
        type: Number,
        default: Math.floor(Math.random() * 9000) + 1000
    },

    creatdAt:{
        type: Date,
        default: Date.now
    }
})

// OrderSchema.index({"onlinePayTime": 1}, {expireAfterSeconds: 0})

module.exports = mongoose.model("Order", OrderSchema)
