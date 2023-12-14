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

    foodDescription:{
        type: String,
        default: ""
    },

    isAvilable:{
        type: Boolean
    },

    isDelete:{
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model("Food", FoodSchema)