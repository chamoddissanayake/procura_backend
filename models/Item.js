var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ITEM_CATEGORIES = require("../params").ITEM_CATEGORIES;

var Item = new Schema({
  itemName: {
    type: String,
    required: true,
  },
  supplierId: {
    type: String,
    required: true,
  },
  wightPerItem: {
    type: Number, // in Kg
    required: false,
    default:10
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(ITEM_CATEGORIES),
  },
  maxQty: {
    type: Number,
    required: true,
  },
  availableQty: {
    type: Number,
    required: true,
  },
  photoURL11: {
    type: String,
    required: false,
    default:"https://firebasestorage.googleapis.com/v0/b/csseproject-5ca2c.appspot.com/o/Procurement%20System%2FItems%2Fcement%2Fcement.png?alt=media&token=96f1e299-6bcd-4119-83c9-59e10b5e58ce"
  },
  photoURL21: {
    type: String,
    required: false,
    default:'https://firebasestorage.googleapis.com/v0/b/csseproject-5ca2c.appspot.com/o/Procurement%20System%2FItems%2Fcement%2Fcement.png?alt=media&token=96f1e299-6bcd-4119-83c9-59e10b5e58ce'
  },
});

module.exports = mongoose.model("Item", Item, "Items");
