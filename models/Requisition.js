var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var REQUISITION_STATUS = require("../params").REQUISITION_STATUS;

var Requisition = new Schema({
  siteManagerUsername: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
  },
  itemId: {
    type: String,
    required: true,
  },
  supplierId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  requiredDate: {
    type: Date,
    required: true,
  },
  siteId: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    default: REQUISITION_STATUS.APPROVAL_PENDING,
    enum: Object.values(REQUISITION_STATUS),
  },
});

module.exports = mongoose.model("Requisition", Requisition, "Requisitions");
