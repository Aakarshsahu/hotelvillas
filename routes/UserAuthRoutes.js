const express = require("express");
const router = express.Router();
const { registerUser , verifyOtp , alluser  } = require("../controllers/UserAuthController");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.get("/allusers", alluser);


module.exports = router;
