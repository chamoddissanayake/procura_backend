const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Supplier = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    supplierLogoURL: {
        type: String,
    },
    supplierMail: {
        type: String,
    }
})

module.exports = mongoose.model("Supplier", Supplier,"Supplier")
