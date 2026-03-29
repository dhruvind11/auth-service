const express = require("express");
const { emailRules, otpVerifyRules } = require("../middleware/validate.middleware");
// const { otpLimiter } = require("../middleware/rateLimiter.middleware");
const {
  sendOtp,
  verifyOtpHandler,
  resendOtp,
} = require("../controllers/otp.controller");

const router = express.Router();

router.post("/send", emailRules, sendOtp);
router.post("/verify", otpVerifyRules, verifyOtpHandler);
router.post("/resend", emailRules, resendOtp);

module.exports = router;
