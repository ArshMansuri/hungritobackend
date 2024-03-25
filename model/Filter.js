const mongoose = require('mongoose')

const FilterSchema = mongoose.Schema({
    type: String,
    name: String,
    access: String
})

module.exports = mongoose.model("Filters", FilterSchema)