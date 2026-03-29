const appleSignin = require("apple-signin-auth");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/auth.service");

/**
 * POST /api/auth/google
 * Receives { credential } (access_token) from frontend @react-oauth/google implicit flow
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google access token is required.",
      });
    }

    // Use the access_token to fetch user info from Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: { Authorization: `Bearer ${credential}` },
      }
    );

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token.",
      });
    }

    const payload = await response.json();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Unable to retrieve email from Google account.",
      });
    }

    // Find or create user
    let user = await User.findOne({ provider: "google", providerId: googleId });

    if (!user) {
      // Check if a user with this email already exists
      user = await User.findOne({ email });

      if (user) {
        // Link Google to existing account
        user.provider = "google";
        user.providerId = googleId;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: name || email.split("@")[0],
          email,
          provider: "google",
          providerId: googleId,
        });
      }
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
      message: "Google sign-in successful.",
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
    console.error("Google auth error:", error.message);
    if (
      error.message.includes("Token used too late") ||
      error.message.includes("Invalid token") ||
      error.message.includes("Wrong number of segments")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token.",
      });
    }
    next(error);
  }
};

/**
 * POST /api/auth/apple
 * Receives { id_token, user (optional) } from frontend react-apple-login popup
 */
const appleAuth = async (req, res, next) => {
  try {
    const { id_token, user: appleUser } = req.body;

    if (!id_token) {
      return res.status(400).json({
        success: false,
        message: "Apple id_token is required.",
      });
    }

    // Verify the id_token with Apple
    const applePayload = await appleSignin.verifyIdToken(id_token, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });

    const { sub: appleId, email } = applePayload;

    // Apple only sends user info (name) on first sign-in
    const appleName =
      appleUser?.name
        ? `${appleUser.name.firstName || ""} ${appleUser.name.lastName || ""}`.trim()
        : null;

    // Find or create user
    let user = await User.findOne({ provider: "apple", providerId: appleId });

    if (!user) {
      if (email) {
        user = await User.findOne({ email });

        if (user) {
          user.provider = "apple";
          user.providerId = appleId;
          if (appleName) user.name = appleName;
          await user.save();
        }
      }

      if (!user) {
        user = await User.create({
          name: appleName || (email ? email.split("@")[0] : "Apple User"),
          email: email || `apple_${appleId}@placeholder.com`,
          provider: "apple",
          providerId: appleId,
        });
      }
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
      message: "Apple sign-in successful.",
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
    console.error("Apple auth error:", error.message);
    if (
      error.message.includes("invalid") ||
      error.message.includes("expired") ||
      error.message.includes("jwt")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Apple token.",
      });
    }
    next(error);
  }
};

module.exports = {
  googleAuth,
  appleAuth,
};
