var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Settings = new Schema({
  limitPrice: {
    type: Number,
    required: true,
  },
  criticalPercentage: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Setting", Settings,"settings");
