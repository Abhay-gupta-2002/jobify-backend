const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  company: String,
  toEmail: String,
  emailText: String,
  status: {
    type: String,
    enum: ["sent", "failed"],
    default: "sent",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  resetPasswordToken: String,
resetPasswordExpiry: Date,

  emailKey: String, // gmail app password
  profilePhoto: String,
  resume: String,

  applications: [applicationSchema], 
});

module.exports = mongoose.model("User", userSchema);
