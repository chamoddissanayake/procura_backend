var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Payments = new Schema({
  OrderId: {
    // type: String,
  },
  price: {
    type: Number,
    // required: true,
  },
  payStatus: {
    type: Boolean,
    // required: true,
  },
});

module.exports = mongoose.model("Payments", Payments);
