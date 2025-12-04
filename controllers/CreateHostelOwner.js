const User = require("../models/User");
const bcrypt = require("bcryptjs");




// ADMIN CREATES HOSTEL OWNER
exports.createHostelOwner = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // VALIDATION
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // CHECK IF EMAIL ALREADY EXISTS
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // CHECK IF PHONE ALREADY EXISTS
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE OWNER
    const owner = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "owner",
      status: true,          // Owner account active
      emailVerified: true    // Admin created → mark verified
    });

    return res.status(201).json({
      message: "Hostel owner created successfully",
      owner: {
        id: owner._id,
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone,
        role: owner.role
      }
    });

  } catch (err) {
    console.log("Create Owner Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
