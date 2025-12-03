const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/mailer");

// FORGOT PASSWORD - SEND OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP with expiry
    user.otpHash = otp; // you can bcrypt this also
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min expiry
    await user.save();

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}`,
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// VERIFY OTP - CONFIRM FOR PASSWORD RESET
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Check OTP
    if (user.otpHash !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // OTP is valid → clear fields
    user.otpHash = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};



// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validate fields
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Email, password and confirmPassword are required" });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

