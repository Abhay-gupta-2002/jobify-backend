const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: String,
    email: String,
    status: {
      type: String,
      default: "Sent",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
