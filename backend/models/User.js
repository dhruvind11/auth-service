const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      // Not required for social auth users
    },
    provider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    providerId: {
      type: String,
    },
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
userSchema.index({ provider: 1, providerId: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
