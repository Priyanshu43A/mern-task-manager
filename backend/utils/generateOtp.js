const crypto = require("crypto");
const Otp = require("../models/otpSchema");

module.exports.generateOTP = async (userId) => {
  const otp = crypto.randomInt(100000, 999999);
  const otpRecord = await Otp.findOne({ user: userId });
  if (otpRecord) {
    otpRecord.otp = otp;
  }
  await Otp.create({ user: userId, otp });
  return otp.toString();
};