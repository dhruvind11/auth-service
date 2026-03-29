const express = require("express");
const { authMiddleware, optionalAuth } = require("../middleware/auth.middleware");
const { signupRules, signinRules } = require("../middleware/validate.middleware");
// const { authLimiter } = require("../middleware/rateLimiter.middleware");
const {
  signup,
  signin,
  refreshTokenHandler,
  logout,
  getMe,
} = require("../controllers/auth.controller");

const router = express.Router();

// Public routes
router.post("/signup", signupRules, signup);
router.post("/signin", signinRules, signin);
router.post("/refresh-token", refreshTokenHandler);

// Protected routes
router.post("/logout", optionalAuth, logout);
router.get("/me", authMiddleware, getMe);

module.exports = router;
