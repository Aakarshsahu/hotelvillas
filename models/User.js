const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  age: {
    type: Number,
    required: true,
  },

  qualification: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  // ROLE SYSTEM
  role: {
    type: String,
    enum: ["user", "owner", "admin"],
    default: "user",
  },

  status: {
    type: Boolean,
    default: false
  },

  otpHash: {
    type: String,
    default: null
  },

  otpExpiry: {
    type: Date,
    default: null
  },

  emailVerified: {
    type: Boolean,
    default: false
  }


}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
