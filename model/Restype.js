const mongoose = require('mongoose')

const ResTypeSchema = mongoose.Schema({
    type:{
        type: String
    }
})

module.exports = mongoose.model("Restype", ResTypeSchema)
