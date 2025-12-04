const express = require("express");
const router = express.Router();
const { registerUser , verifyOtp , alluser , loginUser  } = require("../controllers/UserAuthController");
const { protect , authorizeRoles } = require("../middleware/auth");
const { forgotPassword , verifyResetOtp , resetPassword } = require("../controllers/ForgetPasswordController");
const { createHostelOwner } = require("../controllers/CreateHostelOwner");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.get("/allusers", alluser);
router.post("/login", loginUser);

router.get("/profile", protect , (req, res) => {
  res.send("Protected User Profile");
});

router.get("/owner/dashboard", protect, authorizeRoles("owner"), (req, res) => {
  res.send("Owner Dashboard");
});

router.get("/admin/all-users", protect, authorizeRoles("admin"), (req, res) => {
  res.send("Admin Area");
});


//forget password routes
router.post("/forgetpassword",forgotPassword);
router.post("/forget-password-varify-otp",verifyResetOtp)
router.post("/resetpassword",resetPassword);

//creating Hostel Owner
router.post("/create-hostel-owner",createHostelOwner)



module.exports = router;
