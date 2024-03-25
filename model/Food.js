const mongoose = require('mongoose')

const FoodSchema = mongoose.Schema({

    foodRestaurant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    },

    foodName:{
        type: String,
        required: true 
    },

    foodImage:{
        publicId: {
            type: String,
            required: true
        },
        publicUrl: {
            type: String,
            required: true
        }
    },

    foodPrice:{
        type: Number,
        required: true
    },

    foodType:{
        type: String,
        required: true
    },

    foodCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories'
    },

    foodDescription:{
        type: String,
        default: ""
    },

    foodOffer: {
        isOffer: {
            type: Boolean,
            default: false
        },
        offer:{
            type: String
        }
    },

    foodWeight:{
        type: String,
        required: true
    },

    isAvailable:{
        type: Boolean,
        default: true
    },

    isDelete:{
        type: Boolean,
        default: false
    },
    
    creatdAt:{
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Food", FoodSchema)