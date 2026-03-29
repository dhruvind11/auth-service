const express = require("express");
const { authLimiter } = require("../middleware/rateLimiter.middleware");
const { googleAuth, appleAuth } = require("../controllers/social.controller");

const router = express.Router();

// Google — receive id_token from popup, verify, return JWT
router.post("/google", authLimiter, googleAuth);

// Apple — receive id_token from popup, verify, return JWT
router.post("/apple", authLimiter, appleAuth);

module.exports = router;
