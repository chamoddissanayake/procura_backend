var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Site = new Schema({
  location: {
    type: String,
  },
});

module.exports = mongoose.model("Site", Site, "Sites");
