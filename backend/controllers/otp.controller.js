const User = require("../models/User");
const {
  generateOtp,
  saveOtp,
  verifyOtp,
  sendOtpEmail,
} = require("../services/otp.service");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/auth.service");

/**
 * POST /api/auth/otp/send
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Generate and save OTP
    const otp = generateOtp();
    await saveOtp(email, otp);

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/otp/verify
 */
const verifyOtpHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // Verify OTP
    await verifyOtp(email, otp);

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: email.split("@")[0], // Default name from email
        email,
        provider: "local",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          provider: user.provider,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.message.includes("OTP")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /api/auth/otp/resend
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Generate new OTP
    const otp = generateOtp();
    await saveOtp(email, otp);

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  verifyOtpHandler,
  resendOtp,
};
