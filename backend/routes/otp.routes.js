const express = require("express");
const { emailRules, otpVerifyRules } = require("../middleware/validate.middleware");
const { otpLimiter } = require("../middleware/rateLimiter.middleware");
const {
  sendOtp,
  verifyOtpHandler,
  resendOtp,
} = require("../controllers/otp.controller");

const router = express.Router();

router.post("/send", otpLimiter, emailRules, sendOtp);
router.post("/verify", otpVerifyRules, verifyOtpHandler);
router.post("/resend", otpLimiter, emailRules, resendOtp);

module.exports = router;
