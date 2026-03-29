const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otp");
const { sendEmail } = require("./email.service");

/**
 * Generate a random 6-digit OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Save OTP to database (hashed) with 5-minute expiry
 */
const saveOtp = async (email, otp) => {
  // Delete any existing OTPs for this email
  await Otp.deleteMany({ email });

  // Hash the OTP before storing
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);

  const otpDoc = await Otp.create({
    email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  return otpDoc;
};

/**
 * Verify an OTP against the stored hash
 */
const verifyOtp = async (email, otp) => {
  const otpDoc = await Otp.findOne({
    email,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new Error("No OTP found. Please request a new one.");
  }

  // Check if expired
  if (otpDoc.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: otpDoc._id });
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Compare OTP
  const isValid = await bcrypt.compare(otp, otpDoc.otp);
  if (!isValid) {
    throw new Error("Invalid OTP. Please try again.");
  }

  // Mark as verified and clean up
  await Otp.deleteMany({ email });

  return true;
};

/**
 * Send OTP email via Zoho
 */
const sendOtpEmail = async (email, otp) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0 0 10px; font-size: 24px;">Verification Code</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 0 0 30px; font-size: 14px;">Use the code below to sign in to your account</p>
        <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; margin: 0 0 30px;">
          <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">This code will expire in 5 minutes.<br/>If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Your Verification Code",
    html,
  });
};

module.exports = {
  generateOtp,
  saveOtp,
  verifyOtp,
  sendOtpEmail,
};
