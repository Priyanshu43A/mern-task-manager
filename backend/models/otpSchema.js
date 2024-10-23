const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
  {
    user: { type: mongoose.ObjectId, ref: "User" },
    otp: { type: Number },
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;