const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const transporter = require("../utils/mailer");

//Register and email sent to the user
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, age, qualification, password } = req.body;

    // Validate fields
    if (!fullName || !email || !phone || !age || !qualification || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check duplicate phone
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------
    // 1️⃣ Generate OTP & store hash
    // -----------------------------
    function generateOTP(length = 6) {
      // generates a zero-padded numeric OTP
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
      return String(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    const otp = generateOTP(4); // numeric OTP
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // --------------------------------
    // 2️⃣ Create user in database
    // --------------------------------
    const newUser = await User.create({
      fullName,
      email,
      phone,
      age,
      qualification,
      password: hashedPassword,
      role: "user",
      status: true,
      otpHash,        // save hashed otp
      otpExpiry       // save expiry
    });

    // --------------------------------
    // 3️⃣ Send OTP Email automatically
    // --------------------------------
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your Registration OTP",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    // Create JWT (no expiry)
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET
    );

    // --------------------------------
    // 4️⃣ Final Response
    // --------------------------------
    res.status(201).json({
      message: "User registered successfully. OTP sent to email.",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        age: newUser.age,
        qualification: newUser.qualification,
        role: newUser.role,
        status: newUser.status
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};


//  Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user || !user.otpHash || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP requested for this email" });
    }

    // Check expiry
    if (new Date() > user.otpExpiry) {
      // clear otp fields
      user.otpHash = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Compare entered OTP with hashed stored OTP
    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP correct → clear OTP fields, mark emailVerified true (optional)
    user.otpHash = null;
    user.otpExpiry = null;
    user.emailVerified = true;
    await user.save();

    // Create JWT (no expiry as requested)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
      // no expiresIn to keep token valid until logout
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });

  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//Get all users
exports.alluser = async (req, res) => {
  try {
    const users = await User.find().select("-password -otpHash"); // hide sensitive fields

    res.status(200).json({
      message: "All users fetched successfully",
      total: users.length,
      users
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
