var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Order = new Schema({
  requisitionId: {
    type: String,
  },
  status:{
    type: String,
  },
  orderedCount:{
    type: Number,
  },
  receivedCount:{
    type: Number,
  },
  signature:{
    type: String,
  },
  receivedDate:{
    type: String,
  },
  totalPrice:{
    type: Number,
  },
  payStatus:{
    type: Boolean,
  },
});

module.exports = mongoose.model("Order", Order, "Orders");
