const mongoose = require('mongoose')

const CategoriesSchema = mongoose.Schema({
    type:{
        type: String
    }
})

module.exports = mongoose.model("Categories", CategoriesSchema)