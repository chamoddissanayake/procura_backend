var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var StaffMember = new Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required: true,
  },
  password:{
    type:String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  rank: {
    type: String,
    required: true,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StaffMember", StaffMember, "StaffMembers");
